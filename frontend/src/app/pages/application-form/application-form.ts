import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { Application, ApplicationStatus, ExpectedMobilityPeriod } from '../../models/application.model';
import { HostInstitution } from '../../models/host-institution.model';
import { User, UserRole } from '../../models/user.model';
import { ApplicationModificationLogService } from '../../services/application-modification-log.service';
import { ApplicationService } from '../../services/application.service';
import { HostInstitutionService } from '../../services/host-institution.service';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-application-form',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './application-form.html',
    styleUrl: './application-form.css'
})
export class ApplicationForm implements OnInit {
    hostInstitutions: HostInstitution[] = [];
    lecturers: User[] = [];

    academicYearOptions: string[] = this.createAcademicYearOptions();

    currentUserRole: UserRole | null = null;
    currentApplicationStatus: ApplicationStatus | null = null;

    isEditMode = false;
    isLoading = false;
    isSubmitting = false;
    errorMessage = '';

    private applicationId: string | null = null;

    applicationForm = new FormGroup({
        academicYear: new FormControl(this.academicYearOptions[0], {
            nonNullable: true,
            validators: [Validators.required]
        }),
        expectedMobilityPeriod: new FormControl<ExpectedMobilityPeriod>('first_semester', {
            nonNullable: true,
            validators: [Validators.required]
        }),
        hostInstitution: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required]
        }),
        referentLecturer: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required]
        }),
        hostUniversityArrivalDate: new FormControl('', {
            nonNullable: true
        }),
        hostUniversityDepartureDate: new FormControl('', {
            nonNullable: true
        }),
        modificationDescription: new FormControl('', {
            nonNullable: true
        }),
        learningAgreement: new FormControl<File | null>(null),
        transcriptOfRecords: new FormControl<File | null>(null),
        examMappings: new FormArray([
            this.createExamMappingGroup()
        ])
    });

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly applicationService: ApplicationService,
        private readonly applicationModificationLogService: ApplicationModificationLogService,
        private readonly hostInstitutionService: HostInstitutionService,
        private readonly userService: UserService,
        private readonly authService: AuthService
    ) {}

    ngOnInit(): void {
        this.currentUserRole = this.authService.getCurrentUser()?.role ?? null;
        this.applicationId = this.route.snapshot.paramMap.get('applicationId');
        this.isEditMode = this.applicationId !== null;

        if (!this.isEditMode && this.currentUserRole !== 'student') {
            this.router.navigate(['/applications']);
            return;
        }

        // if (this.isEditMode && this.currentUserRole !== 'student') {
        //     window.alert('Only students can modify an application.');
        //     this.router.navigate(['/applications']);
        //     return;
        // }

        if (!this.isEditMode) {
            this.applicationForm.controls.learningAgreement.setValidators([
                Validators.required
            ]);

            this.applicationForm.controls.learningAgreement.updateValueAndValidity();
        }

        this.loadHostInstitutions();

        this.loadLecturers();

        if (this.applicationId) {
            this.loadApplication(this.applicationId);
        }
    }

    get examMappings(): FormArray {
        return this.applicationForm.controls.examMappings;
    }

    get learningAgreementControl(): FormControl<File | null> {
        return this.applicationForm.controls.learningAgreement;
    }

    get transcriptOfRecordsControl(): FormControl<File | null> {
        return this.applicationForm.controls.transcriptOfRecords;
    }

    get isDuringMobility(): boolean {
        return this.currentApplicationStatus === 'dm_in_progress';
    }

    get isAfterMobility(): boolean {
        return this.currentApplicationStatus?.startsWith('am_') ?? false;
    }

    addExamMapping(): void {
        const mappingGroup = this.createExamMappingGroup();

        this.examMappings.push(mappingGroup);

        if (this.isAfterMobility) {
            this.applyResultValidators(mappingGroup);
        }
    }

    removeExamMapping(index: number): void {
        if (this.examMappings.length === 1) {
            return;
        }

        this.examMappings.removeAt(index);
    }

    onLearningAgreementSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] ?? null;
        const control = this.applicationForm.controls.learningAgreement;

        control.setValue(file);
        control.markAsTouched();
        control.updateValueAndValidity();
    }

    onTranscriptOfRecordsSelected(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (!this.isAfterMobility) {
            input.value = '';

            window.alert(
                'Transcript of Records can only be uploaded after the mobility period.'
            );

            return;
        }

        const file = input.files?.[0] ?? null;
        const control = this.applicationForm.controls.transcriptOfRecords;

        control.setValue(file);
        control.markAsTouched();
        control.updateValueAndValidity();
    }

    onSubmit(): void {
            if (!this.isEditMode) {
                this.submitNewApplication();
                return;
            }

            if (!this.applicationId || !this.currentApplicationStatus) {
                this.errorMessage = 'Application information is missing.';
                return;
            }

            if (
                this.currentUserRole === 'lecturer'
                || this.currentUserRole === 'office_staff'
            ) {
                this.submitDirectApplicationUpdate(
                    this.applicationId
                );

                return;
            }

            if (this.currentApplicationStatus === 'dm_in_progress') {
                this.submitDuringMobilityModification(
                    this.applicationId
                );

                return;
            }

            if (
                this.currentApplicationStatus === 'am_awaiting_transcript_upload'
                || this.currentApplicationStatus === 'am_awaiting_lecturer_review'
            ) {
                this.submitAfterMobilityResults(
                    this.applicationId
                );

                return;
            }

            window.alert(
                this.getModificationBlockedMessage(
                    this.currentApplicationStatus
                )
            );
        }

    cancel(): void {
        if (this.isEditMode && this.applicationId) {
            this.router.navigate([
                '/applications',
                this.applicationId
            ]);

            return;
        }

        this.router.navigate(['/applications']);
    }

    getFullName(firstName: string, lastName: string): string {
        return `${this.capitalize(firstName)} ${lastName.toUpperCase()}`;
    }

    private submitNewApplication(): void {
        this.applicationForm.controls.learningAgreement.setValidators([
            Validators.required
        ]);

        this.applicationForm.controls.learningAgreement.updateValueAndValidity();

        if (this.applicationForm.invalid) {
            this.applicationForm.markAllAsTouched();
            window.alert('Please complete all fields before submitting.');
            return;
        }

        const rawValue = this.applicationForm.getRawValue();

        if (!rawValue.learningAgreement) {
            window.alert('Please upload a Learning Agreement.');
            return;
        }

        const formData = new FormData();

        formData.append('academicYear', rawValue.academicYear);
        formData.append(
            'expectedMobilityPeriod',
            rawValue.expectedMobilityPeriod
        );
        formData.append(
            'hostInstitution',
            rawValue.hostInstitution
        );
        formData.append(
            'referentLecturer',
            rawValue.referentLecturer
        );
        formData.append(
            'examMappings',
            JSON.stringify(
                this.getExamMappingsWithoutEmptyResults()
            )
        );
        formData.append(
            'learningAgreement',
            rawValue.learningAgreement
        );

        this.createApplication(formData);
    }

    private submitDuringMobilityModification(applicationId: string): void {
        const descriptionControl =
            this.applicationForm.controls.modificationDescription;

        descriptionControl.setValidators([
            Validators.required,
            Validators.maxLength(500)
        ]);

        descriptionControl.updateValueAndValidity();

        const learningAgreement =
            this.applicationForm.controls.learningAgreement.value;

        if (descriptionControl.invalid) {
            descriptionControl.markAsTouched();

            window.alert(
                'Please enter a reason for the modification.'
            );

            return;
        }

        if (!learningAgreement) {
            this.applicationForm.controls.learningAgreement.markAsTouched();

            window.alert(
                'Please upload an updated Learning Agreement.'
            );

            return;
        }

        if (this.examMappings.invalid) {
            this.examMappings.markAllAsTouched();

            window.alert(
                'Please complete all exam mapping fields.'
            );

            return;
        }

        const rawValue = this.applicationForm.getRawValue();
        const formData = new FormData();

        formData.append(
            'description',
            rawValue.modificationDescription.trim()
        );
        formData.append(
            'proposedExamMappings',
            JSON.stringify(
                this.getExamMappingsWithoutEmptyResults()
            )
        );
        formData.append(
            'proposedLearningAgreement',
            learningAgreement
        );

        this.isSubmitting = true;
        this.errorMessage = '';

        this.applicationModificationLogService.createModification(
            applicationId,
            formData
        ).subscribe({
            next: () => {
                this.isSubmitting = false;

                window.alert(
                    'Modification request submitted successfully.'
                );

                this.router.navigate([
                    '/applications',
                    applicationId
                ]);
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage =
                    error.error?.message
                    ?? 'Failed to submit modification request.';

                this.isSubmitting = false;
            }
        });
    }

    private submitAfterMobilityResults(applicationId: string): void {
        const transcriptControl =
            this.applicationForm.controls.transcriptOfRecords;

        if (
            this.currentApplicationStatus === 'am_awaiting_transcript_upload'
        ) {
            transcriptControl.setValidators([
                Validators.required
            ]);
        } else {
            transcriptControl.clearValidators();
        }

        transcriptControl.updateValueAndValidity();

        for (const control of this.examMappings.controls) {
            this.applyResultValidators(
                control as FormGroup
            );
        }

        if (this.examMappings.invalid) {
            this.examMappings.markAllAsTouched();

            window.alert(
                'Please enter the exam date and score for every exam.'
            );

            return;
        }

        if (
            this.currentApplicationStatus === 'am_awaiting_transcript_upload'
            && !transcriptControl.value
        ) {
            transcriptControl.markAsTouched();

            window.alert(
                'Please upload the Transcript of Records.'
            );

            return;
        }

        const rawValue = this.applicationForm.getRawValue();
        const formData = new FormData();

        formData.append(
            'examMappings',
            JSON.stringify(rawValue.examMappings)
        );

        if (rawValue.transcriptOfRecords) {
            formData.append(
                'transcriptOfRecords',
                rawValue.transcriptOfRecords
            );
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        this.applicationService.submitExamResults(
            applicationId,
            formData
        ).subscribe({
            next: () => {
                this.isSubmitting = false;

                window.alert(
                    'Exam results submitted successfully.'
                );

                this.router.navigate([
                    '/applications',
                    applicationId
                ]);
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage =
                    error.error?.message
                    ?? 'Failed to submit exam results.';

                this.isSubmitting = false;
            }
        });
    }

    private loadHostInstitutions(): void {
        this.hostInstitutionService.getHostInstitutions().subscribe({
            next: (response) => {
                this.hostInstitutions = response.data;
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage =
                    error.error?.message
                    ?? 'Failed to load host institutions.';
            }
        });
    }

    private loadLecturers(): void {
        this.userService.getLecturers().subscribe({
            next: (response) => {
                this.lecturers = response.data;
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage =
                    error.error?.message
                    ?? 'Failed to load lecturers.';
            }
        });
    }

    private loadApplication(applicationId: string): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.applicationService.getApplicationById(applicationId).subscribe({
            next: (response) => {
                const application: Application = response.data;

                this.currentApplicationStatus = application.status;

                if (!this.canModifyApplication(application.status)) {
                    this.isLoading = false;

                    window.alert(
                        this.getModificationBlockedMessage(
                            application.status
                        )
                    );

                    this.router.navigate([
                        '/applications',
                        application._id
                    ]);

                    return;
                }

                this.addCurrentReferenceOptions(application);

                this.applicationForm.patchValue({
                    academicYear:
                        application.academicYear,
                    expectedMobilityPeriod:
                        application.expectedMobilityPeriod,
                    hostInstitution:
                        application.hostInstitution._id,
                    referentLecturer:
                        application.referentLecturer._id,
                    hostUniversityArrivalDate:
                        this.formatDateForInput(
                            application.hostUniversityArrivalDate
                        ),
                    hostUniversityDepartureDate:
                        this.formatDateForInput(
                            application.hostUniversityDepartureDate
                        )
                });

                if (this.currentUserRole === 'student') {
                    this.disableGeneralInformation();
                }

                this.examMappings.clear();

                for (const mapping of application.examMappings) {
                    this.examMappings.push(
                        this.createExamMappingGroup(mapping)
                    );
                }

                if (this.examMappings.length === 0) {
                    this.examMappings.push(
                        this.createExamMappingGroup()
                    );
                }

                if (this.isDuringMobility) {
                    this.applicationForm.controls.modificationDescription.setValidators([
                        Validators.required,
                        Validators.maxLength(500)
                    ]);
                } else {
                    this.applicationForm.controls.modificationDescription.clearValidators();
                }

                this.applicationForm.controls.modificationDescription.updateValueAndValidity();

                if (this.isAfterMobility) {
                    for (const control of this.examMappings.controls) {
                        this.applyResultValidators(
                            control as FormGroup
                        );
                    }
                }

                this.isLoading = false;
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage =
                    error.error?.message
                    ?? 'Failed to load application.';

                this.isLoading = false;
            }
        });
    }

    private addCurrentReferenceOptions(application: Application): void {
        if (
            !this.academicYearOptions.includes(
                application.academicYear
            )
        ) {
            this.academicYearOptions = [
                application.academicYear,
                ...this.academicYearOptions
            ];
        }

        if (
            !this.lecturers.some(
                (lecturer) =>
                    lecturer._id
                    === application.referentLecturer._id
            )
        ) {
            this.lecturers = [
                application.referentLecturer,
                ...this.lecturers
            ];
        }

        if (
            !this.hostInstitutions.some(
                (institution) =>
                    institution._id
                    === application.hostInstitution._id
            )
        ) {
            this.hostInstitutions = [
                application.hostInstitution,
                ...this.hostInstitutions
            ];
        }
    }

    private canModifyApplication(status: ApplicationStatus): boolean {
        return (
            status === 'dm_in_progress'
            || status === 'am_awaiting_transcript_upload'
            || status === 'am_awaiting_lecturer_review'
        );
    }

    private getModificationBlockedMessage(status: ApplicationStatus): string {
        if (status.startsWith('bm_')) {
            return 'This application cannot be modified during the Before Mobility phase.';
        }

        if (status === 'am_awaiting_staff_verification') {
            return 'This application can no longer be modified because it is awaiting final staff verification.';
        }

        if (status === 'closed') {
            return 'This application has been closed and can no longer be modified.';
        }

        return 'This application cannot be modified in its current state.';
    }

    private disableGeneralInformation(): void {
        this.applicationForm.controls.academicYear.disable();
        this.applicationForm.controls.expectedMobilityPeriod.disable();
        this.applicationForm.controls.hostInstitution.disable();
        this.applicationForm.controls.referentLecturer.disable();
    }

    private applyResultValidators(mappingGroup: FormGroup): void {
        const resultGroup =
            mappingGroup.get('result') as FormGroup | null;

        if (!resultGroup) {
            return;
        }

        const examDateControl =
            resultGroup.get('examDate');

        const scoreControl =
            resultGroup.get('score');

        examDateControl?.setValidators([
            Validators.required
        ]);

        scoreControl?.setValidators([
            Validators.required
        ]);

        examDateControl?.updateValueAndValidity();
        scoreControl?.updateValueAndValidity();
    }

    private createApplication(formData: FormData): void {
        this.isSubmitting = true;
        this.errorMessage = '';

        this.applicationService.createApplication(
            formData
        ).subscribe({
            next: () => {
                this.isSubmitting = false;

                window.alert(
                    'Application saved successfully.'
                );

                this.router.navigate(['/applications']);
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage =
                    error.error?.message
                    ?? 'Failed to save application.';

                this.isSubmitting = false;
            }
        });
    }

    private getExamMappingsWithoutEmptyResults(): Array<{
        foreignCourseCode: string;
        foreignCourseName: string;
        foreignCourseCredits: number;
        caFoscariCourseCode: string;
        caFoscariCourseName: string;
        caFoscariCourseCredits: number;
    }> {
        return this.examMappings.controls.map((control) => {
            const mappingGroup = control as FormGroup;

            return {
                foreignCourseCode:
                    mappingGroup.controls['foreignCourseCode'].value,
                foreignCourseName:
                    mappingGroup.controls['foreignCourseName'].value,
                foreignCourseCredits:
                    mappingGroup.controls['foreignCourseCredits'].value,
                caFoscariCourseCode:
                    mappingGroup.controls['caFoscariCourseCode'].value,
                caFoscariCourseName:
                    mappingGroup.controls['caFoscariCourseName'].value,
                caFoscariCourseCredits:
                    mappingGroup.controls['caFoscariCourseCredits'].value
            };
        });
    }

private getExamMappingsForDirectUpdate(): Array<{
    foreignCourseCode: string;
    foreignCourseName: string;
    foreignCourseCredits: number;
    caFoscariCourseCode: string;
    caFoscariCourseName: string;
    caFoscariCourseCredits: number;
    result?: {
        examDate: string;
        score: string;
    };
}> {
    return this.examMappings.controls.map((control) => {
        const mappingGroup = control as FormGroup;
        const resultGroup = mappingGroup.get('result') as FormGroup;

        const examDate =
            resultGroup.controls['examDate'].value;

        const score =
            resultGroup.controls['score'].value;

        const mapping = {
            foreignCourseCode:
                mappingGroup.controls['foreignCourseCode'].value,
            foreignCourseName:
                mappingGroup.controls['foreignCourseName'].value,
            foreignCourseCredits:
                mappingGroup.controls['foreignCourseCredits'].value,
            caFoscariCourseCode:
                mappingGroup.controls['caFoscariCourseCode'].value,
            caFoscariCourseName:
                mappingGroup.controls['caFoscariCourseName'].value,
            caFoscariCourseCredits:
                mappingGroup.controls['caFoscariCourseCredits'].value
        };

        if (
            typeof examDate === 'string'
            && examDate.trim()
            && typeof score === 'string'
            && score.trim()
        ) {
            return {
                ...mapping,
                result: {
                    examDate,
                    score: score.trim()
                }
            };
        }

        return mapping;
    });
}

    private createExamMappingGroup(mapping?: {
        foreignCourseCode?: string;
        foreignCourseName?: string;
        foreignCourseCredits?: number;
        caFoscariCourseCode?: string;
        caFoscariCourseName?: string;
        caFoscariCourseCredits?: number;
        result?: {
            score?: string | null;
            examDate?: string | null;
        };
    }): FormGroup {
        return new FormGroup({
            foreignCourseCode: new FormControl(
                mapping?.foreignCourseCode ?? '',
                {
                    nonNullable: true,
                    validators: [Validators.required]
                }
            ),
            foreignCourseName: new FormControl(
                mapping?.foreignCourseName ?? '',
                {
                    nonNullable: true,
                    validators: [Validators.required]
                }
            ),
            foreignCourseCredits: new FormControl(
                mapping?.foreignCourseCredits ?? 0,
                {
                    nonNullable: true,
                    validators: [
                        Validators.required,
                        Validators.min(1)
                    ]
                }
            ),
            caFoscariCourseCode: new FormControl(
                mapping?.caFoscariCourseCode ?? '',
                {
                    nonNullable: true,
                    validators: [Validators.required]
                }
            ),
            caFoscariCourseName: new FormControl(
                mapping?.caFoscariCourseName ?? '',
                {
                    nonNullable: true,
                    validators: [Validators.required]
                }
            ),
            caFoscariCourseCredits: new FormControl(
                mapping?.caFoscariCourseCredits ?? 0,
                {
                    nonNullable: true,
                    validators: [
                        Validators.required,
                        Validators.min(1)
                    ]
                }
            ),
            result: new FormGroup({
                examDate: new FormControl(
                    this.formatDateForInput(
                        mapping?.result?.examDate ?? null
                    ),
                    {
                        nonNullable: true
                    }
                ),
                score: new FormControl(
                    mapping?.result?.score ?? '',
                    {
                        nonNullable: true
                    }
                )
            })
        });
    }

    private createAcademicYearOptions(): string[] {
        const currentYear = new Date().getFullYear();

        return Array.from(
            { length: 5 },
            (_, index) => {
                const startYear =
                    currentYear - 1 + index;

                return `${startYear}/${startYear + 1}`;
            }
        );
    }

    private formatDateForInput(value: string | Date | null | undefined): string {
        if (!value) {
            return '';
        }

        if (value instanceof Date) {
            return value.toISOString().slice(0, 10);
        }

        return value.slice(0, 10);
    }

    private capitalize(value: string): string {
        if (!value) {
            return '';
        }

        return (
            value.charAt(0).toUpperCase()
            + value.slice(1).toLowerCase()
        );
    }

    private submitDirectApplicationUpdate(applicationId: string): void {
        if (
            this.currentUserRole !== 'lecturer'
            && this.currentUserRole !== 'office_staff'
        ) {
            return;
        }

        if (
            this.applicationForm.controls.academicYear.invalid
            || this.applicationForm.controls.expectedMobilityPeriod.invalid
            || this.applicationForm.controls.hostInstitution.invalid
            || this.applicationForm.controls.referentLecturer.invalid
            || this.examMappings.invalid
        ) {
            this.applicationForm.markAllAsTouched();

            window.alert(
                'Please complete all required application fields.'
            );

            return;
        }

        const rawValue =
            this.applicationForm.getRawValue();

        const formData = new FormData();

        formData.append(
            'academicYear',
            rawValue.academicYear
        );

        formData.append(
            'expectedMobilityPeriod',
            rawValue.expectedMobilityPeriod
        );

        formData.append(
            'hostInstitution',
            rawValue.hostInstitution
        );

        formData.append(
            'referentLecturer',
            rawValue.referentLecturer
        );

        formData.append(
            'hostUniversityArrivalDate',
            rawValue.hostUniversityArrivalDate
        );

        formData.append(
            'hostUniversityDepartureDate',
            rawValue.hostUniversityDepartureDate
        );

        formData.append(
            'examMappings',
            JSON.stringify(
                this.getExamMappingsForDirectUpdate()
            )
        );

        if (rawValue.learningAgreement) {
            formData.append(
                'learningAgreement',
                rawValue.learningAgreement
            );
        }

        if (rawValue.transcriptOfRecords) {
            formData.append(
                'transcriptOfRecords',
                rawValue.transcriptOfRecords
            );
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        this.applicationService
            .updateApplication(
                applicationId,
                formData
            )
            .subscribe({
                next: () => {
                    this.isSubmitting = false;

                    window.alert(
                        'Application updated successfully.'
                    );

                    this.router.navigate([
                        '/applications',
                        applicationId
                    ]);
                },
                error: (error: HttpErrorResponse) => {
                    this.errorMessage =
                        error.error?.message
                        ?? 'Failed to update application.';

                    this.isSubmitting = false;
                }
            });
    }
}
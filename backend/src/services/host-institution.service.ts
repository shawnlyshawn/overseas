import HostInstitution from '../models/host-institution.model';

export const findHostInstitutions = async () => {
    return HostInstitution.find();
}
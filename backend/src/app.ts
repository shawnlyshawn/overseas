// Express 설정과 route 연결만 담당
// server가 어떤 요청을 어떻게 처리할지 설정
/*
Express 설정
미들웨어 등록
route 연결
에러 처리 미들웨어 연결
*/

import cors from "cors"; // FE, BE 포트가 달라서 주소가 다를 때 요청 허용하기 위한 library - BE에서! cors() 설정하면 포트 달라도 FE 요청 받을 수 O
import express from "express"; // Node.js로 웹 서버 쉽게 만들게 해주는 library

const app = express(); // express 어플리케이션 객체 생성 -> 서버 실제로 실행된 것 X! (포트 열고 실행은 app.listen())
// app.use() / get() / post() / patch() / delete() / listen() 사용 가능

app.use(cors()); // CORS 미들웨어(client 요청이 API에 도착 전, 즉 Route 실행 전에 거치는 중간 처리 단계) 쓸게요
app.use(express.json()); // client가 보낸 JSON을 JS 객체로 변환해주는 미들웨어
// app.use(미들웨어())인건가?

app.get("/api/health", (_req, res) => {
  res.json({ message: "Backend is running" });
}); // /api/gealth로 GET 오믄 이렇게 처리한다잉~ 설정

export default app;
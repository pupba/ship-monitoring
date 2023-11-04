module.exports = (app,connection,crypto,query) =>{
    /** Root 페이지 : 로그인 */
    app.get("/",(req,res)=>{res.render("login",{
        title : "로그인",
        cssfiles : "login"
    })});
    /** 로그인 검증 */
    app.post("/check",(req,res)=>{
        const username = req.body.username;
        const password = req.body.password;
        const query = "SELECT password_hash FROM info WHERE username = ?";
        connection.query(query,[username],(err,results)=>{
            if (err) {
                console.error('쿼리오류',err);
                return;
            }
            else if (results.length === 0){
                res.send('<script>window.location.href="/?parm1=1";</script>');
            }
            else{
                const check = results[0].password_hash;
                const hash = crypto.createHash('sha256').update(password).digest('hex');
                if(hash == check){
                    html = '<script>window.location.href="/list?parm1=3";</script>';
                    res.send(html)
                }
                else {
                    html = '<script>window.location.href="/?parm1=2";</script>';
                    res.send(html);
                }
            }
        })
    });
    /** list 페이지 : 선박 리스트 */
    app.get("/list",(req,res)=>{
        const query = "SELECT * FROM ship_status";
        connection.query(query,(err,results)=>{
            if (err) {
                console.error('쿼리오류',err);
                return;
                // DB의 해시 비밀번호
            }
            else {
                const data = results;
                res.render("list",{
                    title: "선박 리스트",
                    cssfiles : "list",
                    ships : data
                });
            }
        });
    });
    /** 로그아웃 처리 */
    app.post("/logout",(req,res)=>{
        res.send('<script>window.location.href="/";</script>');
    });
    /** Main 관제 페이지 : 선박 관제 페이지 */
    app.get("/control",(req,res)=>{
        const paramValue = req.query.param;
        const query = "SELECT * FROM ship_status where ship_name = ?";
        connection.query(query,[paramValue],(err,results)=>{
            if (err) {
                console.error('쿼리오류',err);
                return;
            }
            else {
                const data = results;
                res.render("control",{
                    title: "메인 관제 페이지",
                    cssfiles : "control",
                    ship: data[0],
                    connect : "정상",
                    videoFeedUrl : "http://localhost:8080/video_feed"
                });     
            }
        });
    });
    /** 해양수산부 */
    app.get("/accident-log",(req,res)=>{
        const query = "SELECT * FROM accident_log";
        connection.query(query,(err,results)=>{
            if (err) {
                console.error('쿼리오류',err);
                return;
            }
            else {
                const data = results;
                res.render("accident",{
                    title: "해양수산부",
                    cssfiles : "accident",
                    data : data,
                    formatDateTime
                });     
            }
        });
    });
    /** 뒤로가기 처리 */
    app.post("/disconnect",(req,res)=>{
       res.send('<script>alert("연결종료!"); window.location.href="/list";</script>');
    });
    /** 사고기록 */
    app.get("/event-log",(req,res)=>{
        const query = "SELECT * FROM event_log";
        connection.query(query,(err,results)=>{
            if (err) {
                console.error('쿼리오류',err);
                return;
            }
            else {
                const data = results;
                res.render("event",{
                    title: "사고기록",
                    cssfiles : "event",
                    data : data,
                    formatDateTime
                });     
            }
        });
    });
    /** 수동 신고 */
    app.post("/report",(req,res)=>{
        const data = req.body;
        let stage = "";
        if (data.stage == 0){
            stage = "돌고래 0단계";
        }
        else if (data.stage == 1){
            stage = "돌고래 1단계";
        }
        else{
            stage = "돌고래 2단계";
        }
        const query1 = "INSERT INTO accident_log(datatime,ship_name,location,etc) VALUES ('"+formatDateTime(data.datetime)+"','"+data.shipN+"','"+data.location+"','"+data.etc+"')";
        const query2 = "INSERT INTO event_log(datatime,ship_name,location,stage) VALUES ('"+formatDateTime(data.datetime)+"','"+data.shipN+"','"+data.location+"','"+stage+"')";
        connection.query(query1,(err,results)=>{
            if (err) {
                console.error('쿼리오류',err);
                return;
            }
        });
        connection.query(query2,(err,results)=>{
            if (err) {
                console.error('쿼리오류',err);
                return;
            }
            else {
                res.send('<script>alert("신고완료!");');
            }
        });
    });
    /** 테러대응 수동제어 */
    app.post("/manual",(req,res)=>{
        const query = req.body.query;
        connection.query(query,(err,results)=>{
            if (err) {
                console.error('쿼리오류',err);
                return;
            }
            else{
                // 테러대응 선박으로 제어 명령 전송
                const tmp = query.split(" ")[3];
                const order = {module:tmp.split("=")[0],status:tmp.split("=")[1]};
                console.log(order);
                // const url = ""
                // fetch(url, {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json' // JSON 데이터를 보내는 경우
                //     },
                //     body: JSON.stringify(order) // 데이터를 JSON 문자열로 변환하여 전송
                // }).catch(error => {
                //     console.error("post 에러");
                // });
            }
        });
    });
    /** 해적정보 */
    app.get("/pirate",(req,res)=>{
        const paramValue = req.query.location;
        res.render("pirate",{
            title: "해적정보",
            cssfiles : "pirate",
            location : paramValue
        });
     });
}
const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
    return formattedDate
}
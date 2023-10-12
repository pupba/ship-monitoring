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
                res.send('<script>alert("아이디를 확인해주세요!"); window.location.href="/";</script>');
            }
            else{
                const check = results[0].password_hash;
                const hash = crypto.createHash('sha256').update(password).digest('hex');
                if(hash == check){
                    res.send('<script>alert("로그인 성공!"); window.location.href="/list";</script>')
                }
                else {
                    res.send('<script>alert("비밀번호를 확인해주세요!"); window.location.href="/";</script>');
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
        res.send('<script>alert("로그아웃!"); window.location.href="/";</script>');
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
                    connect : "정상"
                });     
            }
        });
    });
    /** 신고기록 */
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
                    title: "신고기록",
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
        const query1 = "INSERT INTO accident_log(datatime,ship_name,location,etc) VALUES ('"+formatDateTime(data.datetime)+"','"+data.shipN+"','"+data.location+"','"+"bording"+"')";
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
}
const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
    return formattedDate
}
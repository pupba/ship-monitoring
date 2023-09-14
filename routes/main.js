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
                // DB의 해시 비밀번호
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
    /** 사고 기록확인 페이지 : 사고 기록확인 페이지 */
    app.get("/log",(req,res)=>{res.render("accident",{
        title:"사고기록 확인",
        cssfiles:"accident",
        data : [{time:"2023-03-18 10:22:13",name:"새누리1",loaction:"GANA",stage:"돌고래1단계",etc:"hello"},
        {time:"2023-03-18 10:12:13",name:"새누리2",loaction:"KONGO",stage:"돌고래0단계",etc:"hello"},
        {time:"2023-03-18 10:32:13",name:"새누리3",loaction:"Korea",stage:"돌고래2단계",etc:"hello"}]
    })});
    /** 뒤로가기 처리 */
    app.post("/disconnect",(req,res)=>{
       res.send('<script>alert("연결종료!"); window.location.href="/list";</script>');
    });
}
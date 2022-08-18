var express = require('express');
var router = express.Router();

var dbget = require('../db/get.js');
var dball = require('../db/all.js');
var dbdo = require('../db/exec.js');

/* User Home */
router.get('/', async function(req, res, next) {
    if (req.session.login == undefined){
        res.redirect('/home');
    }
});

/* Add New ToDo */
router.get('/add', async function(req, res, next) {
    if (req.query.seat == undefined){
        res.redirect('/home');
        return;
    }

    let seat = req.query.seat;
    let date = new Date();
    let date_t = Math.floor(date.getTime()/1000);//UNIXタイム（秒単位に切り捨て）

    
    let sql = "update seats set time='" +date_t+ "',status=0 where seat=" +seat;//メイン操作
    await dbdo.exec(sql);

    sql = "insert into logs (log_time,log_seat) values('" +date_t+ "','" +seat+ "');";//ログ操作
    await dbdo.exec(sql);

    res.redirect('/info'+'?seat='+seat);

    /*res.render('add', {
        title: '着席'
    });*/
});
router.post('/add', async function(req, res, next) {
    /*let seat = req.body.seat;
    let time = req.body.time;
    let status = req.body.status;
    let sql = "update seats set time='" +time+ "',status=" +status+ " where seat=" +seat;
    await dbdo.exec(sql);
    res.redirect('/');*/
});


router.get('/view', async function(req, res, next) {
    let sqli = "select * from inside WHERE id="+req.query.id;
    let recordi = await dball.getAllRows(sqli);

    let sqlo = "select * from outside WHERE bid="+recordi[0].outroute;
    let recordo = await dball.getAllRows(sqlo);

    let io = recordo[0].broute +"-"+ recordi[0].inroute;
    let n = io.length / 8;

    res.render('view', {
        way: io,
        step: n,
        data1: recordo,
        data2: recordi,
        title: '道案内',
    });
});

router.get('/search', async function(req, res, next) {
    let sql1 = "select * from outside";
    let sql2a = "select * from inside";
    let record1 = await dball.getAllRows(sql1);
    let record2a = await dball.getAllRows(sql2a);
    var change_a = { 101:0, 102:1, 103:2, 104:3, 105:4, 106:5, 107:6, 108:7, 109:8, 110:9, 111:10, 112:11, 114:12, 115:13, 116:14, 117:15, 118:16, 119:17, 120:18, 121:19, 122:20, 123:21, 124:22, 125:23, 126:24, 131:25, 132:26, 133:27, 135:28, 136:29, 151:30, 152:31, 153:32, 154:33, 155:34, 156:35, 157:36, 158:37, 159:38, 160:39, 161:40, 162:41, 163:42, 164:43, 165:44, 166:45, 171:46, 172:47, 173:48, 174:49, 175:50, 176:51, 177:52, 178:53, 179:54, 180:55, 191:56, 192:57, 193:58, 194:59, 195:60, 201:61, 202:62, 203:63, 204:64, 205:65, 206:66, 207:67, 208:68, 211:69, 212:70, 213:71, 214:72 };

    res.render('search', {
        title: '検索',
        data1: record1,
        data2a: record2a,
        changer: change_a,
        enter: "null",
    });
});
router.post('/search', async function(req, res, next) {
    let sql1 = "select * from outside";
    let sql2 = "select * from inside WHERE name like '%"+req.body.sword+"%' OR keyword like '%"+req.body.sword+"%'";
    let sql2a = "select * from inside";
    let record1 = await dball.getAllRows(sql1);
    let record2 = await dball.getAllRows(sql2);
    let record2a = await dball.getAllRows(sql2a);
    var change_a = { 101:0, 102:1, 103:2, 104:3, 105:4, 106:5, 107:6, 108:7, 109:8, 110:9, 111:10, 112:11, 114:12, 115:13, 116:14, 117:15, 118:16, 119:17, 120:18, 121:19, 122:20, 123:21, 124:22, 125:23, 126:24, 131:25, 132:26, 133:27, 135:28, 136:29, 151:30, 152:31, 153:32, 154:33, 155:34, 156:35, 157:36, 158:37, 159:38, 160:39, 161:40, 162:41, 163:42, 164:43, 165:44, 166:45, 171:46, 172:47, 173:48, 174:49, 175:50, 176:51, 177:52, 178:53, 179:54, 180:55, 191:56, 192:57, 193:58, 194:59, 195:60, 201:61, 202:62, 203:63, 204:64, 205:65, 206:66, 207:67, 208:68, 211:69, 212:70, 213:71, 214:72 };

    res.render('search', {
        title: '検索',
        data1: record1,
        data2: record2,
        data2a: record2a,
        changer: change_a,
        enter: req.body.sword,
    });
});


router.get('/user', async function(req, res, next) {
    if (req.session.login == undefined){
        res.redirect('/users/login');
    }
    let sql = "select *,datetime(finished,'+9 hours') from todo where user_id=" + 
            req.session.login.id + ' order by finished asc';
    let records = await dball.getAllRows(sql);
    res.render('user', {
        title: 'User Home',
        login: req.session.login,
        data: records,
    });
});


router.get('/home', async function(req, res, next) {
    res.render('home', {
        title: 'home'
    });
});

router.get('/about', async function(req, res, next) {
    res.render('about', {
        title: 'about'
    });
});

router.get('/info', async function(req, res, next) {

    let d = new Date();
    let dt = (d.getMonth()+1)*100+d.getDate();//日付４桁

    res.render('info', {
        title: 'ご協力ありがとうございます。',
        seat: req.query.seat,
        date: dt,
    });
});




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

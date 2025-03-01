const axios = require('axios')
const sign_in = require('./src/signIn');
const draw = require('./src/draw');
const dipLucky = require('./src/dipLucky');
const sendMail = require('./src/sendMail');
const getPoint = require('./src/getPoint');
const { headers, corpid, secret, touser, agentid } = require('./src/config');
const { autoGame } = require('./src/games/autoRun');

(async () => {
  // 上次分数
  const yesterday_score = await getPoint();

  console.log(`昨日矿石：${yesterday_score}`);

  let sign_res = '';
  try {
    sign_res = await sign_in();
  } catch (error) {
    sign_res = error;
  }
  console.log(sign_res);
  let draw_res = '';
  try {
    draw_res = await draw();
  } catch (error) {
    draw_res = error;
  }

  console.log(draw_res);

  let game_res = '挖矿成功！';
  try {
    await autoGame();
  } catch (error) {
    game_res = '挖矿失败！';
  }

  // 当前分数
  const now_score = await getPoint();

  console.log(`当前矿石：${now_score}`);

  let dip_res;
  try {
    dip_res = await dipLucky();
  } catch (error) {
    dip_res = error;
  }

  console.log(dip_res);

  try {
    const gettokenURL = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${secret}`
    var getAccess_token = await axios.get(gettokenURL)
  } catch (error) {
    console.log('获取token错误', error)
  };
  try {
    console.log('Token值：',getAccess_token)
    const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${getAccess_token.data.access_token}`;
    await axios.post(url, {
      "touser": touser,
      "agentid": agentid,
      "msgtype": "textcard",
      "textcard": {
        "title": '掘金定时任务',
        "description": `<div>签到结果：${sign_res}</div><div>抽奖结果：${draw_res}</div><div>沾喜气结果：${dip_res}</div><div>游戏结果：${game_res}</div><div>当前矿石：${now_score}</div><div>较昨日增长：${now_score - yesterday_score}</div>`,
        "url": "URL",
        "btntxt": "点击没用"
      }
    }).then(res => {
      console.log('发送结果：', res.data)
    });
  } catch (error) {
    console.log('发送失败error', error)
  };
})();

const Keyv = require('keyv')
const Discord = require('discord.js');
const client = new Discord.Client()
//client関数
const ser = new Keyv('sqlite://db.sqlite', { table: 'certification' })
//DBのテーブル作成
const deltime = 60;
//メッセージを消す時間(秒)

client.on('ready', async () => {
    //This will get the amount of servers and then return it.
    const servers = await client.guilds.cache.size
    const users = await client.users.cache.size
    
    console.log(`Botは今 ${servers} 個のサーバーに入ってるよー`)

    client.user.setActivity(`!help | 導入数 ${servers} `, {
        type: 'PLAYING',
    })
})

.on("message", async message => {

    if (message.content == "!sporrt") {
        const embed = {
            embed: {
                title: "サポートサーバーです",
                description: "SupportServer",
                color: 0xffff00,
                fields: [{
                    name: "URL",
                    value: "https://discord.gg/Y6w5Jv3EAR",
                    inline: false,
                }],
            },
        };
        message.channel.send(embed);
    }




    if (message.content == "!help") {
        const embed = {
            "embed": {
                "title": "helpです",
                "description": "This is Help commands",
                "color": 0xffff12,
                "fields": [
                    {
                        "name": "!help",
                        "value": "今、表示しているやつです",
                        "inline": false
                    },
                    {
                        "name": "!ping",
                        "value": "ping値を出します",
                        " inline": false
                    },
                    {
                        "name": "!sporrt",
                        "value": "サポサバのURLを表示します",
                        "inline": false
                    },
                    {
                        "name": "!登録 [IDまたはメンション]",
                        "value": "認証ロールを登録します。",
                        "inline": false

                    },
                    {
                        "name": "!削除",
                        "value": "登録情報を削除します。",
                        "inline": false
                    },
                    {
                        "name": "!確認",
                        "value": "設定の確認ができます。",
                        "inline": false
                    },
                    {
                        "name": "!認証",
                        "value": "認証コードが発行されます。",
                        "inline": false
                    }]
            }
        }
        message.channel.send(embed);
    }



    if (message.content == "!ping") {
        message.channel.send(` Ping を確認しています...`).then((pingcheck) => {
            pingcheck.edit(
                `botの速度|${pingcheck.createdTimestamp - message.createdTimestamp} ms`
            )
        })
    }
})

client.on('message', async message => {
  //messageイベント発火
    if (!message.channel.type == "text" || message.author.bot) return;
    //textチャンネル以外とBOTは処理しない
    if (message.content.startsWith("!登録")) {
      //メッセージが!登録だった場合
      if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send('NOADOMIN');
      //権限確認
        const args = message.content.split(" ").slice(1);
          //メッセージのコマンドを抜いた部分を配列にしてargsに代入
        const role = message.mentions.roles.first();
        //メンションされた情報をroleに代入
        if (!args[0]) return message.reply("引用がないよ");
        //もしコマンドだけなら
        if (role) {
            //メンションされた場合の処理
             message.member.roles.add(role)
             //メッセージを打った人にロールを与える
             .then(async() => {
              //成功した場合
                await ser.set(message.guild.id, `${message.channel.id},${role.id}`)
                //DBにギルドID(key)でチャンネルIDとロールIDを書き出す
                message.reply(`登録が完了しました!!\nロール:${role}\nchannel:${message.channel}`);
                //完了のメッセージを送る
            })
            .catch(e => message.reply(`エラー1:${e.message}`));
            //失敗した場合
        } else {
            //メンション以外
             message.member.roles.add(args)
             //打たれた文字列をメッセージを打った人につける
             .then(async() => {
               //成功した場合
                await ser.set(message.guild.id, `${message.channel.id},${args}`)
                //DBにギルドID(key)でチャンネルIDとロールIDを書き出す
                message.reply(`登録が完了しました!!\nロール:${message.guild.roles.cache.find(role => role.id === args)}\nchannel:${message.channel}`);
                //完了のメッセージを送るその際ロールIDをギルド内で検索してロールメンションの状態にする
            })
            .catch(e => message.reply(`エラー2:${e.message}`));
            //失敗した場合
        }
    }
    if (message.content === "!削除") {
      //打たれたメッセージが!削除の場合
      if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send('NOADOMIN');
      //権限確認
        const content = await ser.get(message.guild.id);
        //contentにDBから取得した値を代入
        if (!content) return message.reply("登録がされていません");
        //もしも何も代入されていなかったら処理しない
        const check = content.split(",");
        //,で区切って配列にする
        await ser.delete(message.guild.id);
        //keyからそのサーバーの情報を消す
        message.reply(`情報を削除しました!!\n詳細\nチャンネル:${message.guild.channels.cache.find(channels => channels.id === check[0])}\nロール${message.guild.roles.cache.find(role => role.id === check[1])}`);
        //チャンネルIDとロールIDをギルド内で検索して表示している
    }
    if (message.content === "!確認") {
      //打たれたメッセージが!確認の場合
        const content = await ser.get(message.guild.id);
        //contentにDBから取得した値を代入
        if (!content) return message.reply("登録がされていません");
        //もしも何も代入されていなかったら処理しない
        const check = content.split(",");
        //,で区切って配列にする
        message.reply(`登録詳細\nチャンネル:${message.guild.channels.cache.find(channels => channels.id === check[0])}\nロール:${message.guild.roles.cache.find(role => role.id === check[1])}`);
        //チャンネルIDとロールIDをギルド内で検索して表示している
    }
    if (message.content === "!認証") {
      //打たれたメッセージが!認証だったら
        message.delete()
        //!認証のメッセージを消す
        const content = await ser.get(message.guild.id);
        //DBからギルドIDを使ってチャンネルIDとロールIDを取得
        if (!content) return message.reply("登録がされていません");
        //取得できなかったら処理しない
        const check = content.split(",");
        //取得した値を,で区切って配列にする
        if (check[0] !== message.channel.id) return;
        //DBからとったチャンネルIDと現在のチャンネルIDがあってるか確かめるあっていなかったら処理しない
        const Canvas = require('canvas');
        //canvas読み込み
        var S = "abcdefghjkmnpqrstuvwxyz23456789"
        //出したい文字列
        var N = 6
        //桁数
        var A = Array.from(Array(N)).map(() => S[Math.floor(Math.random() * S.length)]).join('');
        //ランダムな英数字を作成

        //ここから下はdocs見て
        let fontSize = 50;
        const {
            registerFont
        } = require('canvas');
        registerFont('1.ttc', {
            family: 'Yusei Magic'
        });
        const applyText = (canvas, text) => {
            const context = canvas.getContext('2d');
            do {
                context.font = `${fontSize / 2}px UD Yusei Magic`;
            } while (context.measureText(text).width > canvas.width - 300);
            return context.font;
        };
        const canvas = Canvas.createCanvas(700, 250);
        const context = canvas.getContext('2d');
        const background = await Canvas.loadImage('https://discordjs.guide/assets/canvas-preview.30c4fe9e.png'); //背景
        context.drawImage(background, 0, 0, canvas.width, canvas.height);
        context.strokeStyle = '#0099ff';
        context.strokeRect(0, 0, canvas.width, canvas.height);
        context.font = `${fontSize}px UD Yusei Magic`;
        context.fillStyle = '#ffffff';
        context.fillText(A, canvas.width / 2.5, canvas.height / 1.8);
        context.font = applyText(canvas, message.author.tag);
        context.fillStyle = '#ffffff';
        context.fillText(`${message.author.tag}さんの認証コードは`, canvas.width / 2.5, canvas.height / 3.5);
        context.beginPath();
        context.arc(125, 125, 100, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();
        const avatar = await Canvas.loadImage(message.author.displayAvatarURL({
            format: 'png'
        }));
        context.drawImage(avatar, 25, 25, 200, 200);
        context.drawImage(avatar, 25, 0, 200, canvas.height);
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'ser.png');
        const main = await message.reply("認証コードだよ", {
            files: [attachment]
        });
        //作った画像を送る
        main.delete({
            timeout: deltime * 1000
        })
        //送ったメッセージをdeltime秒後に消す
        message.channel.awaitMessages(m => m.author.id == message.author.id, {
            max: 1,
            time: deltime * 1000
        })
        //メッセージをdeltime秒待つ
        .then(collected => {
          //成功した場合
            if (!collected.first()) return message.reply("timeout");
            //何も取得されていなかった場合処理しない
            collected.first().delete();
            //取得したメッセージを消す

            if (collected.first().content == A) {
              //取得したメッセージがランダムな英数字と一緒だったら
                message.member.roles.add(check[1])
                //メッセージを打った人にロールを付ける
                .then(() => {
                  //成功した場合
                    message.reply("認証成功")
                    //メッセージを送る
                    .then(c => c.delete({timeout: deltime * 1000}));
                    //メッセージを送るのに成功した場合メッセージをdeltime秒後に消す
                })
                .catch(e => message.channel.send(`エラー4:${e.message}`));
                //ロールを付けるのに失敗した場合
            } else {
              //一緒ではなかったら
                message.reply("認証失敗")
                //失敗のメッセージを送る
                .then(d => d.delete({timeout: deltime * 1000}));
                //失敗メッセージをdeltime秒後に消す
            }
        }).catch(e => message.channel.send(`エラー5:${e.message}`));
        //メッセージを待ってる間にエラーが起きた場合
    }
})

client.login("BotTOKEN")

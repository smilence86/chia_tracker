# chia_tracker

Tracking your chia wallets and receiving notifications which getting rewards from mining xch coin.

You can configure multi-wallets to tracking, notifier for multi-users to receiving, It's safe and will not leak your wallet address or something else, run it at your own local devices without risk.

It's open source and easy to use with docker, support multi-arch such as x86, arm.

&nbsp;  

## Get wechat sckey or telegram token

Currently there are two ways to get notifications:

Wechat serverChan: [https://sct.ftqq.com/forward](https://sct.ftqq.com/forward)  
Telegram bot: [https://core.telegram.org/bots#6-botfather](https://core.telegram.org/bots#6-botfather)

&nbsp;  

## Edit config
```json
{
    "interval": 5,
    "accounts": [
        {
            "wallet": "xch1******",
            "notifier": {
                "wechat": [
                    {
                        "name": "loki",
                        "enable": true,
                        "sckey": ""
                    }
                ],
                "telegram": [
                    {
                        "name": "loki",
                        "enable": true,
                        "token": "166*******:AA*******************",
                        "chat_id": "42*******"
                    }
                ]
            },
            "history": [
                
            ]
        }
    ]
}

```

## Run with docker
```{r, engine='sh', count_lines}
docker run --name chia_tracker --restart always -d -v /folder_path/config.json:/usr/src/app/config.json -e TZ=Asia/Chongqing smilence86/chia_tracker:latest
```
* Replacing "folder_path" with yours.

* Available timezones are here: [timezones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
  
&nbsp;  

## Check log
```{r, engine='sh', count_lines}
docker logs -f chia_tracker
```

## Upgrade docker image
```{r, engine='sh', count_lines}
# stop container
docker stop chia_tracker

# delete container
docker rm chia_tracker

# download newest image
docker pull smilence86/chia_tracker:latest

# remove untagged images
docker rmi $(docker images -f "dangling=true" -q)

# run container again
docker run --name chia_tracker --restart always -d -v /folder_path/config.json:/usr/src/app/config.json -e TZ=Asia/Chongqing smilence86/chia_tracker:latest
```

&nbsp;  

## Statistic docker container
```{r, engine='sh', count_lines}
docker stats chia_tracker
```
&nbsp;  

## Test notifications

You can make a test with faucets below:  
[https://faucet.chia.net](https://faucet.chia.net)  
[https://xchfaucet.togatech.org](https://xchfaucet.togatech.org)

or visit [https://chialinks.com/faucets](https://chialinks.com/faucets) to get more.

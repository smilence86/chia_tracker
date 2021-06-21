# chia_tracker

Tracking your chia wallets which mining xch coin and getting a reward, receiving notifications through multi-channels.

## Edit config
```json
{
    "interval": 5,
    "accounts": [
        {
            "wallet": "",
            "notifier": {
                "wechat": [
                    {
                        "enable": true,
                        "sckey": ""
                    }
                ],
                "telegram": [
                    {
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
docker run --name chia_tracker --restart always -d -v /folder_path/config.json:/usr/src/app/config.json -e TZ=Asia/Chongqing smilence86/chia_tracker:latest /bin/sh -c 'cd /usr/src/app && node index.js'
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
docker run --name chia_tracker --restart always -d -v /folder_path/config.json:/usr/src/app/config.json -e TZ=Asia/Chongqing smilence86/chia_tracker:latest /bin/sh -c 'cd /usr/src/app && node index.js'
```

## Statistic docker container
```{r, engine='sh', count_lines}
docker stats chia_tracker
```

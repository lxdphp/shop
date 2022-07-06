docker pull registry.rocket.chat/rocketchat/rocket.chat:latest
docker-compose stop rocketchat
docker-compose rm rocketchat
docker-compose up -d rocketchat



true


EYYBFLHNJNWMKJNO

RIKVMJBKZYQNDIKU

b89a898b-1bfe-41c9-aadc-5a3570fdfc8c

查看docker 

docker ps

进入 docker

 sudo docker exec -it 0da5bd808642  /bin/bash


 1 电子邮箱
 这块密码要用客户端密码 端口用25  不勾选别的选项 


 # 创建并进入工作目录
mkdir /opt/rocketchat
cd /opt/rocketchat
# 下载编排文件
curl -L https://raw.githubusercontent.com/RocketChat/Rocket.Chat/develop/docker-compose.yml -o docker-compose.yml

curl -L https://go.rocket.chat/i/docker-compose.yml -O



docker run -itd --name mongo --restart=on-failure:10 -d -m 1G --memory-swap 4G -p 27017:27017 \
-v /data/mongodb:/data/db \
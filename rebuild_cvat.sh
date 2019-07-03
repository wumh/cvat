docker-compose -f docker-compose.yml -f components/analytics/docker-compose.analytics.yml  -f components/openvino/docker-compose.openvino.yml -f docker-compose.override.yml down
docker rmi -f cvat:latest
./cvat_up.sh

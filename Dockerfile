FROM cvat_040:latest

COPY cvat /home/django/cvat  
#RUN python3 manage.py collectstatic

#EXPOSE 8080 8443
#ENTRYPOINT ["/usr/bin/supervisord"]

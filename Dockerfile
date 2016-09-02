FROM ubuntu:latest
MAINTAINER Sergey Lushkovsky "s.lushkovsky@gmail.com"
RUN apt-get update && apt-get upgrade -y \
RUN apt-get install -y \
    build-essential \
    ca-certificates \
    git \
    python3.5 \
    python3.5-dev \
    python3-pip \
    redis-server
COPY . /app
WORKDIR /app
RUN pip3 install -r requirements.txt
ENTRYPOINT ["python3"]
CMD ["manage.py runserver -h 0.0.0.0 -p 5000"]
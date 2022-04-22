FROM amazonlinux:2

RUN yum install -y awscli

COPY run-tests.sh ./
RUN chmod +x run-tests.sh

ENTRYPOINT ["/run-tests.sh"]
FROM amazonlinux:2

RUN yum install -y awscli
RUN yum install -y shadow-utils
RUN useradd -ms /bin/bash AutomationUser

COPY run-tests.sh ./
RUN chmod +x run-tests.sh
RUN chown AutomationUser: ./run-tests.sh

USER AutomationUser

ENTRYPOINT ["./run-tests.sh"]
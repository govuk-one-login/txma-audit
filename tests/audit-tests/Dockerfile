FROM amazoncorretto:11

ARG BUILD_DATE
ARG COMMIT_SHA
ARG GIT_REPO

LABEL "BUILD_DATE" = ${BUILD_DATE}
LABEL "COMMIT_SHA" = ${COMMIT_SHA}
LABEL "GIT_REPO" = ${GIT_REPO}

RUN yum install -y awscli
RUN yum install -y shadow-utils
RUN useradd -ms /bin/bash AutomationUser

COPY run-tests.sh ./

RUN chmod +x run-tests.sh
RUN chown AutomationUser: ./run-tests.sh

RUN mkdir reports

RUN chmod -R 777 /reports
RUN chown -R AutomationUser: /reports

WORKDIR /home/AutomationUser

# copy source code over
COPY ./ ./

#Install Gradle and dependencies
RUN chmod -R 777 /home/AutomationUser
RUN chown -R AutomationUser: /home/AutomationUser
RUN wget https://services.gradle.org/distributions/gradle-7.4.2-bin.zip -P /tmp
RUN unzip -d /opt/gradle /tmp/gradle-*.zip

ENV GRADLE_HOME=/opt/gradle/gradle-7.4.2
ENV PATH=$PATH:$GRADLE_HOME/bin

RUN echo $PATH
RUN gradle -v

ENTRYPOINT ["/home/AutomationUser/run-tests.sh"]

USER AutomationUser
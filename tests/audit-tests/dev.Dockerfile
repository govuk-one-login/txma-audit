FROM amazoncorretto:11
ARG BUILD_DATE
ARG COMMIT_SHA
ARG GIT_REPO
LABEL "BUILD_DATE" = ${BUILD_DATE}
LABEL "COMMIT_SHA" = ${COMMIT_SHA}
LABEL "GIT_REPO" = ${GIT_REPO}
# cannot copy files to container root directory as docker build fails
WORKDIR /usr/src/
RUN yum install -y awscli
RUN yum install -y shadow-utils
RUN yum install -y wget
RUN yum install -y unzip
RUN mkdir reports
#Install Gradle and dependencies
RUN wget https://services.gradle.org/distributions/gradle-7.4.2-bin.zip -P /tmp
RUN unzip -d /opt/gradle /tmp/gradle-*.zip
ENV GRADLE_HOME=/opt/gradle/gradle-7.4.2
ENV PATH=$PATH:$GRADLE_HOME/bin
RUN echo $PATH
RUN gradle -v
# copy source code over
COPY ./ .
ENTRYPOINT ["./run-tests.sh"]
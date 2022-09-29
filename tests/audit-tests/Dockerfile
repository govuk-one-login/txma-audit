FROM amazoncorretto:11

ARG BUILD_DATE
ARG COMMIT_SHA
ARG GIT_REPO

LABEL "BUILD_DATE" = ${BUILD_DATE}
LABEL "COMMIT_SHA" = ${COMMIT_SHA}
LABEL "GIT_REPO" = ${GIT_REPO}

RUN yum install -y awscli shadow-utils wget unzip jq xz tar gzip Xvfb

# download latest chromedriver and place in $PATH
RUN wget -O chromedriver_linux https://chromedriver.storage.googleapis.com/2.40/chromedriver_linux64.zip
RUN unzip chromedriver_linux
RUN mv chromedriver /usr/local/bin/chromedriver

# download latest chrome
RUN wget -O chrome_x64.rpm https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
RUN yum localinstall -y *.rpm

# download latest selenium
RUN wget -O selenium-server.jar https://github.com/SeleniumHQ/selenium/releases/download/selenium-4.4.0/selenium-server-4.4.0.jar

RUN mkdir reports

#Install Gradle and dependencies
RUN wget https://services.gradle.org/distributions/gradle-7.4.2-bin.zip -P /tmp
RUN unzip -d /opt/gradle /tmp/gradle-*.zip

ENV GRADLE_HOME=/opt/gradle/gradle-7.4.2
ENV PATH=$PATH:$GRADLE_HOME/bin
ENV BROWSER=chrome-headless

RUN echo $PATH
RUN gradle -v

# copy source code over
COPY ./ ./

ENTRYPOINT ["./run-tests.sh"]

#!/usr/bin/env groovy

@Library('kanolib') _

pipeline {
    agent {
        label 'ubuntu_18.04'
    }
    post {
        regression {
            notify_culprits currentBuild.result
        }
    }
    stages {
        stage('checkout') {
            steps {
                checkout scm
            }
        }
        stage('tools') {
            steps {
                script {
                    def NODE_PATH = tool 'Node 8.11.2'
                    env.PATH = "${env.PATH}:${NODE_PATH}/bin"
                    def YARN_PATH = tool 'yarn'
                    env.PATH = "${env.PATH}:${YARN_PATH}/bin"
                }
            }
        }
        stage('install dependencies') {
            steps {
                script {
                    sshagent(['read-only-github']) {
                        sh "yarn --production=false"
                    }
                }
            }
        }
        stage('checkstyle') {
            steps {
                script {
                    sh "yarn checkstyle-ci || exit 0"
                    step([$class: 'CheckStylePublisher', pattern: 'eslint.xml'])
                }
            }
        }
    }
}

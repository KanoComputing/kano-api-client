#!groovy

node {

    try {
       stage('prepare') {
          env.NODE_ENV = 'staging'
          if (env.BRANCH_NAME == 'prod') {
            env = 'production'
          }
          def nodeHome = tool name: "Node 10.0.0", type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
          env.PATH = "${nodeHome}/bin:${env.PATH}"
          sh "node -v"
          sh "npm -v"
       }

       stage('Checkout'){
          checkout scm
       }

       stage('Test'){
         sh 'npm install'
         sh 'npm install'
         sh 'npm test'
       }
    }
    catch (err) {
        throw err
    }

}

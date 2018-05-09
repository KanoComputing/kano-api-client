#!groovy

node {

    currentBuild.result = "SUCCESS"

    try {
       stage('prepare') {
          env.NODE_ENV = 'staging'
          if (env.BRANCH_NAME == 'prod') {
            env = 'production'
          }
          def nodeVersion = readNodeVersion()
          def nodeHome = tool name: "Node ${nodeVersion}", type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
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
        currentBuild.result = "FAILURE"
        throw err
    }

}
def readNodeVersion () {
    def packageJsonString = readFile('./package.json')
    def packageJson = new groovy.json.JsonSlurper().parseText(packageJsonString)
    return packageJson.engines.node
}

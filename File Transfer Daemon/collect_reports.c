#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <syslog.h>

#define EXIT_SUCCESS 0
#define EXIT_FAILURE -1

void collect_reports(void) 
{
       pid_t pid = fork(); 
       if (pid == EXIT_FAILURE) 
       { // check if there was an error creating the child process
              syslog(LOG_ERR, "Failed to create child process");
              exit(EXIT_FAILURE); //Creating child process failed
       }
       else if (pid == EXIT_SUCCESS) 
       { // child process
              int ret = system("mv /media/sf_Shared_VM/Systems_Software/xml_upload_directory/*.xml /media/sf_Shared_VM/Systems_Software/dashboard_directory"); //Runs bash line from c program
              if (ret == EXIT_FAILURE) 
              {
                     syslog(LOG_ERR, "Failed to transfer reports to dashboard_directory");
                     exit(EXIT_FAILURE);
              }
              else 
              {
                     syslog(LOG_INFO, "Reports successfully transferred to dashboard_directory");
                     exit(EXIT_SUCCESS);
              }
       }
       else 
       { // parent process
              int status;
              waitpid(pid, &status, 0); // wait for child process to finish 
       }
}

    


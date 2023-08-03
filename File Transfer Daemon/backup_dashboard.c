#include <time.h>
#include <unistd.h>
#include <stdio.h>
#include <syslog.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <stdlib.h>

#define SUCCESS_EXIT 0
#define EXIT_FAILURE -1

void backup_dashboard(void) 
{
    pid_t pid;
    int status;
    pid = fork();
    if (pid == EXIT_FAILURE) 
    {
        syslog(LOG_ERR, "Failed to fork() process.");
        exit(EXIT_FAILURE); //Creating child process failed
    } 
    else if (pid == 0) 
    {
        // child process
        system("for file in /media/sf_Shared_VM/Systems_Software/dashboard_directory/*.xml; do cp \"$file\" \"/media/sf_Shared_VM/Systems_Software/dashboard_directory/backup/$(basename \"$file\" .xml)_$(date +%Y-%m-%d).xml\"; done");
        exit(EXIT_SUCCESS);
    } 
    else 
    {
        // parent process
        if (waitpid(pid, &status, 0) == EXIT_FAILURE) 
        {
            syslog(LOG_ERR, "Error waiting for child process.");
            exit(EXIT_FAILURE);
        }
        if (WIFEXITED(status) && WEXITSTATUS(status) == SUCCESS_EXIT) 
        {
            syslog(LOG_INFO, "Dashboard backup succeeded.");
        } else 
        {
            syslog(LOG_ERR, "Dashboard backup failed.");
            exit(EXIT_FAILURE);
        }
    }
}




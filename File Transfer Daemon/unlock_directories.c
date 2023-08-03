#include <sys/types.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <sys/stat.h>
#include <syslog.h>

#define EXIT_SUCCESS 0
#define EXIT_FAILURE -1

void unlock_directories() 
{
    pid_t pid;
    int status;

    syslog(LOG_INFO, "Unlocking relevant directories");
    pid = fork();
    if (pid == EXIT_FAILURE) 
    {
        syslog(LOG_ERR, "Failed to fork() process");
        exit(EXIT_FAILURE); //Creating child process failed
    } 
    else if (pid == EXIT_SUCCESS) 
    {
        system("chmod -R  770 /media/sf_Shared_VM/Systems_Software/xml_upload_directory"); //Commands to unlock directories
        system("chmod -R  770 /media/sf_Shared_VM/Systems_Software/dashboard_directory/");
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
        if (WIFEXITED(status) && WEXITSTATUS(status) == EXIT_SUCCESS) 
        {
            syslog(LOG_INFO, "Directories unlocked successfully.");
        } 
        else 
        {
            syslog(LOG_ERR, "Failed to unlock directories.");
            exit(EXIT_FAILURE);
        }
        
    }
    
}

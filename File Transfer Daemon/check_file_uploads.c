#include <stdio.h>
#include <dirent.h>
#include <string.h>
#include <syslog.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

#define EXIT_SUCCESS 0
#define EXIT_FAILURE -1

void check_file_uploads(void) 
{
    pid_t pid;
    int status;
    syslog(LOG_INFO, "Checking file uploads");

    pid = fork();
    if (pid == EXIT_FAILURE) 
    {
        syslog(LOG_ERR, "Failed to fork() process.");
        exit(EXIT_FAILURE);
    } 
    else if (pid == EXIT_SUCCESS) 
    {
        // child process
        DIR *directory; 
        struct dirent *entry;
        char *dir_name = "/media/sf_Shared_VM/Systems_Software/xml_upload_directory"; //Path to be changed to source file that will check xml reports
        char *files[] = {"Warehouse.xml","Manufacturing.xml","Sales.xml","Distribution.xml"};
        char *search[4];
        directory = opendir(dir_name); //Error checking if file can't be found
        if (directory == NULL) 
        {
            syslog(LOG_ERR, "Error opening directory.\n");
            exit(EXIT_FAILURE);
        }

        while ((entry = readdir(directory)) != NULL) { //Reads every file in specified directory if found
                char *extension = strrchr(entry->d_name, '.'); // Get the file extension
                if (extension != NULL && strcmp(extension, ".xml") == 0) //
                {
                    int j = 0;
                    for (int i = 0; i < 4; i++) 
                    {
                        if (strcmp(files[i], entry->d_name) == 0) 
                        {
                             //syslog(LOG_INFO, "%s not found in directory", files[i]);
                             //printf("%s",files[i]);
                             search[j] = files[i];
                             
                        }
                        j++;
                    }
                }
            }
            int j=0;
             for (int i = 0; i < 4; i++) 
            {
                       
                 if(search[j] == files[i])
                 {
                    syslog(LOG_INFO, "%s in directory", search[j]);
                    
                 }
                 else
                 {
                    syslog(LOG_INFO, "%s not in directory", files[j]);
                 }
                j++;
                        
            }

           closedir(directory); //Closes specified directory after opening it
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
            syslog(LOG_INFO, "File uploads checked successfully.");
        } 
        else 
        {
            syslog(LOG_ERR, "Failed to check file uploads.");
            exit(EXIT_FAILURE);
        }
    }
    
}

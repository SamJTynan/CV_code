
#include <sys/types.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <sys/stat.h>
#include <syslog.h>

#define EXIT_SUCCESS 0
#define EXIT_FAILURE -1


void generate_reports(void) {
     pid_t pid = fork(); 
       if (pid == EXIT_FAILURE) 
       { // check if there was an error creating the child process
              syslog(LOG_ERR, "Failed to create child process");
              exit(EXIT_FAILURE); //Creating child process failed
       }
       else if (pid == EXIT_SUCCESS) 
       { // child process
              int ret = system("touch /media/sf_Shared_VM/Systems_Software/xml_upload_directory/Warehouse.xml touch /media/sf_Shared_VM/Systems_Software/xml_upload_directory/Manufacturing.xml touch /media/sf_Shared_VM/Systems_Software/xml_upload_directory/Sales.xml touch /media/sf_Shared_VM/Systems_Software/xml_upload_directory/Distribution.xml ");//Runs bash line from c program
              if (ret == EXIT_FAILURE) 
              {
                     
                     exit(EXIT_FAILURE);
              }
              else 
              {
                     
                     exit(EXIT_SUCCESS);
              }
       }
       else 
       { // parent process
              int status;
              waitpid(pid, &status, 0); // wait for child process to finish 
       }
}

    


    
    
    
    //system("touch /media/sf_Shared_VM/Systems_Software/xml_upload_directory/Warehouse.xml touch /media/sf_Shared_VM/Systems_Software/xml_upload_directory/Manufacturing.xml touch /media/sf_Shared_VM/Systems_Software/xml_upload_directory/Sales.xml touch /media/sf_Shared_VM/Systems_Software/xml_upload_directory/Distribution.xml ");


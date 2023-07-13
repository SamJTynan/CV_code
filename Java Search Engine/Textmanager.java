package Project.Search.Engine;

//Class for managing the text of the respective classes
	import java.io.File;
	import java.io.FileNotFoundException;
	import java.util.ArrayList;
	import java.util.Scanner;
	import java.util.Arrays;
	import java.util.HashMap;
	
	
public class Textmanager { //Variables used for the entire class

	private File fileexamp; //Used for the actual file name 
	public ArrayList<String> list = new ArrayList<String>(); //Temporary list for holding words 
	private String line = ""; 
	public HashMap<String, Integer> index = new HashMap<String, Integer>(); //Used to keep track of words that appear in files and the amount of times said word appears
	private int counter; //Used to keep track of things based on for loops
	
		
	public void setfilename(String filename) { //Method to set the name of file to open 

		fileexamp= new File(filename); 
	}
		
	public void passfile(File thisfile){ //Sets the file name to the file variable
	
		fileexamp= thisfile; 
			
	}
		
		
	public void readfile() //Method for dealing with the stop list
	{
		list.clear();
		try //Try and catch in case file isn't present
		{ 
			Scanner scan = new Scanner(fileexamp); //Scanner to go through file
			while (scan.hasNextLine()) //While loop to keep going as long as the scanner has lines to go through 
		 		{ 
					line = scan.nextLine(); //Total line in file is set to the line variable 
		 			list.addAll(Arrays.asList(line.replaceAll("[^a-zA-Z ]","").toLowerCase().split("\\s+"))); 
		 				
		 			/*After being added to the line variable everything outside of a a-z is replaced with " " 
		 			estentially deleting it using .replaceAll() then getting rid of all capital letters 
		 			.toLowerCase() and each word is split into a seperate entry based on whitespace using 
		 			\\s+ and .split()*/
		 		} 
		 		scan.close(); //Closes file
		 			
		}
			
		catch (FileNotFoundException e)
		{ 
			System.out.println("Could not find the file specified"); //Warning if file not found
		}
			
	}

	public void countwords() //Reads the words from the file and indexs them
	 { 
		index.clear();//Removes all the words from stop list from the other file list

		 	for (String word : list) //For loop that runs through the list containing all the words from the file
		 		{
		 			if (index.containsKey(word)) //If the index Hashmap already contains the current word as a key its value gets incremented by 1
		 			  {
		 		             counter++;
		 		                
		 		      } else //If the index Hashmap doesnt contain the word as a key it gets added with its counter set as one
		 		              
		 		        	 counter = 1; 
			 		         index.put(word, counter); 
		 		} 
		 			
	} 
		 
		 
		 
}	


package Project.Search.Engine;

//Class for dealing whith searching through document based on user input
	import java.util.ArrayList;
	import java.util.HashMap;
	import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import javax.swing.JOptionPane;

	public class Search {
	private String filename; //Name of the file or files being searched
	private ArrayList<String> list; //Collection of the words being searched 
	private HashMap<String, Integer> index;
	private HashMap<String, Set<String>> database = new HashMap<String, Set<String>>(); //Keeps track of all words and each respective document they appear in
	private ArrayList<String> words; //Array of the words that the user inputs to search
	private java.util.ArrayList<Search> collection; //The list of instances of the search class that lets the user add any amount of documents they want to use to search
	private HashSet<String> results = new HashSet<String>(); //Set the results of the files the user searches are kept



	public Search  (String filename , ArrayList<String> list ,HashMap<String, Integer> index) 
	{ //Constructor for each instances of the Search class
			this.filename = filename; //Name of each file being searched
			this.list =list; //List of amount of words that appear in the file
			this.index = index; //Hashmap of the amount of times each word appears
			
	}
	
	public Search(ArrayList<String> words, ArrayList<Search> collection) 
	{ //Second constructor to pass the instance list and the words the user is looking for into
		this.words = words; //String list of words user is trying to search for
		this.collection = collection; //List of instances of Search class passed from the GUI class
	}
	
	
	public HashSet <String> Engine() 
	{ //The method that handles the searching in the class
	    	
	    	for(Search search : collection) //Goes through every instance stored in collection
	    	{
	    		
	    		for(String entry:search.list) //Goes through every word from each list in every instance
	    		{
	    		
	    			if ( database.containsKey(entry) == false) //Checks to see if word is in dictionary or not
	    			{
	    				HashSet<String> temp = new HashSet<String>(); //Created to keep track of files the words appear in
	    				temp.add(search.filename);
	    				database.put(entry, temp); //New word and file name are added to the Hashmap
	    			
	    			}
	    			else if ( database.containsKey(entry) == true) //Checks if word is in dictionary or not 
	    			{
	    			
	    				database.get(entry).add(search.filename); // If word is already added as a key it updates the set value with the name of the file it apeared in 
	    				
	    			}
	    		}	
			
	    	}
	    	 
	    	try {
	    	
		    	HashSet<String> temp = new HashSet<String>(); 
		    	temp.add(words.get(0)); //First word the user enters in added to a new temporary set to make sure user atleast entered one word
		    	for (String restof:words) //Goes through the rest of the words array
				{ 
					if(restof.contains("*")==true) //Checks if current key contains a *
					{
						for (String key : database.keySet()) //Goes through entire data base
						{
							restof =restof.replace("*", ""); //Gets rid of the * to test if 
							if(key.contains(restof)==true)
							{
								results.addAll(database.get(key));
							}
						}
						
					}
		    		temp.add(restof); //If the user wants to search for more than one word then the rest of the words array is added to the set
					results.addAll(database.get(restof)); //Whatever value of the restof variable is taken from the database hashmap and then added to the results set 
					
				}
		    	
				
	    	}
	    	catch (Exception parseError){
	    		JOptionPane.showMessageDialog(null, "No results found please select different documents or reenter your search" );	
	    	}
	    	return results;
	    	
			  	
	}
	
}
	
		
	
	
	
	

package Project.Search.Engine;


//Class for dealing with the GUI
	import java.awt.FlowLayout;
	import java.awt.event.ActionEvent;
	import java.awt.event.ActionListener;
	import java.io.File;
	import java.util.ArrayList;
	import java.util.Arrays;
	import java.util.HashSet;
	
	import javax.swing.BoxLayout;
	import javax.swing.JButton;
	import javax.swing.JFileChooser;
	import javax.swing.JFrame;
	import javax.swing.JLabel;
	import javax.swing.JPanel;
	import javax.swing.JTextArea;
	import javax.swing.JTextField;
	import javax.swing.WindowConstants;

public class MyGUI extends JFrame  implements ActionListener{

	
	private JPanel leftside; //Panel for segmenting on the left side of the window 
	private JPanel rightside; //Panel for segmenting on the right side of the windo
	private JButton adddoc; //Button for adding documents
	private JButton cleardocs; //Button for clearing documents
	
	private JTextField enter; //Textfield to enter searches into
	private JTextArea tarea; //Text area to show users the documents theyre searching
	private JTextArea rarea; //Text area to show users their results
	private JLabel label; //Label for indicate search bar
	private String word; //String the text the user enters is converted to
	private HashSet<String> output = new HashSet<String>(); //Set thats used to story the results of the engine method from the Search class 
	private ArrayList<String> history = new ArrayList<String>(); //Used to store file names of every document being searched 
	private String filename; //Used to store the name of files
	private ArrayList<String> words = new ArrayList<String>();  //List thats passed into Search class 
	private ArrayList<Search> list = new ArrayList<Search>(); //Used to store the instances of each Search class created

	
	MyGUI()
	{
			
		  super("Search Engine");
			
		  setSize(900,300); //Sets the dimensions of the window
		  setLayout(new FlowLayout()); //Sets the layout of the frame
		  leftside = new JPanel (); //Segements objects the left side of the window
		  rightside = new JPanel (); //Segements objects the left side of the window
		  leftside.setLayout(new BoxLayout(leftside, BoxLayout.Y_AXIS)); //BoxLayout makes sure everything added is centred on the Y axis instead of the X on
		  rightside.setLayout(new BoxLayout(rightside, BoxLayout.Y_AXIS));
		  adddoc = new JButton ("Add document"); //Buttons for calling the textmanagement class and to create an instance of it
		  adddoc.addActionListener(this); //Action listener attatched to make it respond when clicked on
		  cleardocs = new JButton ("Clear documents"); //Button for clearing the documents that were added into the instance list
		  cleardocs.addActionListener(this);//Action listener attatched to make it respond when clicked on
		  enter = new JTextField(10); //Text field for entering the word users want to search
		  enter.addActionListener(this); //Action listener attatched to make it respond when entered
		  tarea = new JTextArea("Documents:\nNone", 1, 1); //The text area the user can see which documents theyre searching
		  rarea = new JTextArea("Results: ", 5, 1); //The text area the user can see the results of what they searched
		  label = new JLabel("Search:"); //Label above the enter textfield 
		  
		  
		   
		
		  leftside.add(adddoc); 
		  leftside.add(cleardocs);
		  leftside.add(tarea);
		  add(leftside);
		  rightside.add(label);
		  rightside.add(enter);
		  rightside.add(rarea);
		  add(rightside);
		  
		  setVisible(true); //Makes sure everything added to the frame is visible
		  setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE); //To make sure process stops once programs stops and doesnt run in the backgroup and take up memeory
		   
	}
	
	public void actionPerformed(ActionEvent e) 
	{
		
	
		
		if 	(e.getSource() == adddoc) //Runs if user presses the add document button in the GUI	
	    { 
			Textmanager objbutton = new Textmanager(); //Creates a new instance of the textmanager class
			JFileChooser chooser = new JFileChooser(); //Creates file chooser
			int check = chooser.showOpenDialog(this);
		    if (check == JFileChooser.APPROVE_OPTION) {
			  
			   File selected = chooser.getSelectedFile(); //Puts the file the user picked
		       objbutton.passfile(selected); //Passes the file into the textmanager class
		       objbutton.readfile(); //Actually breaks every word up into an entry in a list
		       objbutton.countwords();
		       filename = selected.getName(); //Coverts the path of the file into just the name of the file
		       history.add(filename); //Adds the filename from the latest instance to keep track of files user is searching though
		       list.add(new Search(filename,objbutton.list,objbutton.index)); //Name of file and list files content
		       tarea.setText("Documents:\n");  
		       for (String element: history)
		       {
		    	   tarea.append(element +"\n"); //Adds filenames to Document text area
		       }
		   }
	    }
		else if (e.getSource() == cleardocs) //Runs if user presses the clear button in the GUI	
	    { //Clears almost everything including text areas documents that were being searched etc
			list.clear(); 
			history.clear();
			tarea.setText("Documents:\nNone");
			rarea.setText("Results:");
	    }
		
		else if (e.getSource() == enter) //Runs if the user enters text in the text field in the GUI	
		{ 
			 
			words.clear(); //Clears the words array to make method reusabile 
			word = enter.getText(); //Gets the string user entered into the text field 
			words.addAll(Arrays.asList(word.replaceAll("[^a-zA-Z+* ]","").toLowerCase().split("\\s+"))); //Breaks the word string into an array in its most simplest form to make it easier to index in other classes and methods
			Search results = new Search(words,list); //Creates a new instance of the Search class to use in this method, both the list of search instances and words array based on the users input are passed into it as a constructor  
		    output=results.Engine(); //The results of the engine method is passed out into the output set in order to be able to appear on the relevant text area in the GUI
		    if(output.isEmpty()==false) //Checks to make sure the user gets some sort of result in the output set incase the user makes an error or files selected dont have word they requested
		    { 
		    	rarea.setText("Results:"); //Makes sure user cant spam the results text area with the same message 
		    	rarea.append("\n Your search can most likely be found be found in: \n"); //Lists all file names saved to output set into the respective text area
			    for (String element: output) //Goes through every element in the output set
			       {
			    	   rarea.append(element +"\n"); //Adds each entry to the text area
			       }
			}
		    else //Else statement incase the user doesnt get anything back so text area doesnt change
		    {
		    	rarea.setText("Results:"); 
		    }
		   
		}
		
		  
	}
}
		  
	







	



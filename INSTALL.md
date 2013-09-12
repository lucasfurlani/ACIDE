# ACIDE INSTALLATION
----------------------------------------------------------------------

To install simply place the contents of the system in a web accessible
folder.


## Write capabilities

Ensure that the following have write capabilities:

    `/config.php`
    `/data (including subfolders)`
    `/workspace`

## Java WS Configuration

For the 'java' command work properly in the terminal, you have to configure the javaws so it can generate the required jar files.

### Creating the '.keys' file

  TODO

### Updating the file `term.php` to point to the `.keys` file path

Open the file `components/terminal/emulator/term.php`.

Go to line `266`:
  `system("jarsigner -keystore /var/codiad_files/jaxb.keys -storepass 'keystore password' " . $jar_path_and_name . " http://hci.csit.upei.ca/");`

In line `266` do the following:
  - Overwrite `/var/codiad_files/jaxb.keys` to point to the `.keys` file you just created.
  - Overwrite `http://hci.csit.upei.ca/` with your own website address.




## System Installation
    
Navigate in your browser to the URL where the system is placed and the
installer screen will appear. If any dependencies have not been met the
system will alert you.

Enter the requested information to create a admin account, and
set your timezone and submit the form. If everything goes as planned 
you will be greeted with a login screen.

After logging in as the admin:

 - Create a new course.
 - Add a professor to the course.
 - Logged as a professor: Add students to a course
 
 
DO NOT use the admin account to manage courses.

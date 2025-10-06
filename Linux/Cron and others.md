free
=====

The free command in Linux is used to display information about the system's memory usage. It provides details about total memory, used memory, free memory, and memory used by buffers/cache, which can help you monitor how your system's RAM is being utilized.

Useful options for the free command:

free -h: Displays the memory in a human-readable format (e.g., GB, MB).
free -m: Shows the memory in megabytes.
free -g: Shows the memory in gigabytes.
free -s <seconds>: Repeats the output every <seconds>.
free -t: Shows the total memory (including swap).



AWK command
============
 
-> awk '{print}' table.txt  —-> display the complete data. 
-> awk '/manager/ {print}' table.txt  —> manger matches.
-> awk '{print $0}' table.txt  → Display the complete data.
→  awk '{print $1,$4}' table.txt

→ awk '{print NR,$1,$4}' table.txt   --> NR means row number

→ awk '{print NR,$1,$NF}' table.txt  → NF means last field 
—> awk 'NR==3, NR==6 {print NR,$0}' table.txt   --> row 3 to 6
→ awk '{print $1,"----->",$4}' table.txt

-> awk '$3 > 50 {print $1, $2}' table.txt

-> awk 'NR >= 10 && NR <= 20' file.txt --> This will print lines 10 to 20 from file.txt

-> awk '{print $1, $2 * $3}' file.txt


awk command use cases
======================

1. Log File Analysis
--------------------
system administrators often use awk to analyze log files (e.g., Apache logs, system logs) for errors or performance metrics.

Example: Find the number of error entries in an Apache log:


awk '$9 >= 400 {print $0}' access.log

This command looks for HTTP status codes greater than or equal to 400 (indicating errors like 404 or 500) and prints the log entries with errors.

2. User Data Extraction
-----------------------

who -u | awk '{print $1, $3, $4}'

This extracts the username, login date, and login time for users currently logged in.


3. Server Log Parsing (Parsing and Filtering Logs)
--------------------------------------------------

awk '$1 == "192.168.1.100" {print $0}' access.log

ex:
192.168.1.1 - - [01/Feb/2025:12:34:56 +0000] "GET /index.html HTTP/1.1" 200 2345 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
192.168.1.1 - - [01/Feb/2025:12:34:56 +0000] "GET /index.html HTTP/1.1" 200 2345 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"

192.168.1.100 - - [01/Feb/2025:12:34:56 +0000] "GET /index.html HTTP/1.1" 200 2345 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"

192.168.1.1 - - [01/Feb/2025:12:34:56 +0000] "GET /index.html HTTP/1.1" 200 2345 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"

192.168.1.1 - - [01/Feb/2025:12:34:56 +0000] "GET /index.html HTTP/1.1" 200 2345 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"



This filters log entries for requests coming from IP address 192.168.1.100.


4. Monitoring Disk Usage
------------------------

df -h | awk '{gsub("%", "", $5); if ($5+0 > 18) print $1, $5 "%"}'



This prints all filesystems that are over 90% full, which is useful for system monitoring and alerting.

















wget
====

The wget command in Linux is a widely used tool for downloading files from the web. It supports downloading via HTTP, HTTPS, and FTP protocols, and it can handle things like resuming interrupted downloads or downloading multiple files at once.


Ex: wget https://dlcdn.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.tar.gz





cron tab: scheduling tasks
===========================


syntax:
-------

* * * * * /path/to/command
- - - - -
| | | | |  
| | | | +---- Day of the week (0 - 6) (Sunday = 0)
| | | +------ Month (1 - 12)
| | +-------- Day of the month (1 - 31)
| +---------- Hour (0 - 23)
+------------ Minute (0 - 59)



→ Crontab is available for all the users.
crontab -l  : How many jobs are currently configure.
crontab -e  —>edit the crontab
crontab -r  —> remove the crontab
#crontab -l -u kkfunda  → to see other users crontab, only root user can run this.

$sudo touch /etc/cron.allow  —> remove cron access to normal user.
#sudo vi /etc/cron.allow  —> add user here.

vi hello.sh

echo “welcome to KK FUNDA”
echo “today date is:”
date
uptime

How to run the shell script?

sh hello.sh  —-> It will run
./hello.sh    —--> don't have exec permissions → chmod u+x hello.sh

*/1 * * * * /home/ec2-user/hello.sh  >> /home/ec2-user/hello.log



crontab -e —-> paste that command
crontab -l
NOTE: we dont want to loose the previous o/p[ >> ]  → append the standard o/p.

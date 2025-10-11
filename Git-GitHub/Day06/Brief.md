**[Git And GitHub]{.underline}**

**[Git:]{.underline}** It is software. It offers CLI functionality. It
is a version control system tracks the changes

**[Github:]{.underline}** It is a service, It is cloud-based hosting
platform for git repositories, It offers GUI functionality.

-   Github is a source code management tool

-   Similar to github we have gitlab, bitbucket etc..,

  -----------------------------------------------------------------------------
  **Feature**     **Git**                      **GitHub**
  --------------- ---------------------------- --------------------------------
  **Type**        Version control system       Cloud-based hosting platform for
                                               Git repositories

  **Function**    Tracks changes in code       Enables collaboration, sharing,
                  locally                      and project management

  **Interface**   Command-line tool (with      Web-based graphical interface
                  optional GUIs)               

  **Location**    Operates on your local       Hosted online, requires internet
                  machine                      access

  **Ownership**   Open-source, maintained by   Owned by Microsoft
                  the Linux Foundation         

  **Security**    No built-in user management  Supports authentication, access
                                               control, and permissions

  **Use Case**    Solo development, offline    Team collaboration, open-source
                  work                         
  -----------------------------------------------------------------------------

🛠️ **How they work together**:

-   You use **Git** to manage your code locally committing changes,
    branching, and merging.

-   You use **GitHub** to host that code online, collaborate with
    others, review changes, and track issues.

Repository: It is just like our Folder to push or store our code. We
often call it as repo.

-   In windows local machine we call it as Folder

-   In mac or Linux machines we call it as directory

-   Similarly in Git Terminology we call it as Repository or Repo

📁 A **repository** is essentially a central place where data, files, or
code are stored and managed. The exact meaning depends a bit on the
context:

**🧠 Common Types of Repositories**

-   **Code Repository** (most popular in software development):

    -   Stores source code, version history, and collaboration notes.

    -   Example platforms: GitHub, GitLab, Bitbucket.

    -   Often uses version control tools like Git to track changes.

-   **Data Repository**:

    -   Stores datasets for analysis, research, or backup.

    -   Used in academic, scient ific, and business contexts.

-   **Package Repository**:

    -   Hosts software libraries and packages for installation.

    -   Examples: npm for JavaScript, PyPI for Python, NuGet for .NET.

-   **Artifact Repository**:

    -   Stores built/compiled software components like binaries,
        libraries.

    -   Examples: JFrog Artifactory, Nexus Repository.

**[Git Flow:]{.underline}**

**Working directory or workspace**: It means folder in our local machine
initiated with *git init.*

-   git init: it initializes our folder as a git folder

**Staging area**: Staging area means ready to commit some of the files.
"*git add \<file name\>" or "git add ."* these command helps us to bring
the files to staging area

-   Staging area is like a intermediate zone before committing the code

```{=html}
<!-- -->
```
-   git add \<file name\>: it will bring the particular file to the
    staging area

-   git add . : it will bring all the files in the git initialized to
    the staging area.

**Repo or Local Repository:** The moment we do a git commit; it means
the *repo* is onto a checking stage

-   git commit -m "commit message"

**Remote Repository or Github:** once we committed the code, it means
all the changes are saved and our working tree is clean, we can now push
our code to the github repository with git push command

-   git push -u origin main

> ![](media/image1.png){width="2.944595363079615in"
> height="2.0001027996500436in"}

![Git blob](media/image2.png){width="6.268055555555556in"
height="4.190277777777778in"}

git fetch:

**What it does:**\
Downloads the latest commits, branches, and tags from the **remote
repository** into your local .git directory.

**Important:** It does **not** update your working directory or merge
changes into your current branch.

**When to use:**

-   If you want to see what others have pushed before merging into your
    work.

-   To check for updates without affecting your current files.

![](media/image3.png){width="6.268055555555556in"
height="2.4027777777777777in"}

git pull:

**What it does:**\
git pull = git fetch + git merge (by default).\
It downloads changes from the remote and directly merges them into your
current branch.

**When to use:**

-   If you are ready to bring remote changes into your branch right
    away.

![](media/image4.png){width="6.268055555555556in"
height="1.3722222222222222in"}

  ---------------------------------------------------------------------------
  **Command**   **Action**
  ------------- -------------------------------------------------------------
  git fetch     Downloads changes from remote, **does not** update your
                working branch

  git pull      Downloads changes and **immediately merges** into current
                branch
  ---------------------------------------------------------------------------

**\<\<Git Flow completed\>\>**

**Atomic commits:** keep commits centric to one feature or one component
or on fix. Focused on one thing

**[Setting Git usernames:]{.underline}**

1\. Set a Git username: git config \--global user.name "Scarlet Johnson"

2\. Set a Git email: git config \--global user.email
"scarletjohnson.marvel.com"

3\. Set a default code editor to Vscode *on* commit: git config
\--global core.editor "code wait"

**[Gitignore:]{.underline}** it is actually a file with name
*.gitignore.* means it won't track the data.

Whatever the file name present inside the *.gitignore* file, git will
not track or push the data into github(Remote repo).

-   **Usecase:** in every project there are some files like environment
    variables, node modules, api keys or any information file contains
    secret key. We should not push the data into github. In that case
    all those file name mentioned in the **.gitignore** file.

**[Branches:]{.underline}** like an alternative timeline

Git by default creates Master branch

-   Head Master

-   **Head** points to where a branch is currently at.

Cmd: git branch: it will show the all the branches in our ***local
computer*** and the current branch will be highlighted with \*(symbol)
prefix the branch

git branch -r: it will show all the branches that are in ***Remote***

git branch -a: it will show all the branches in ***local computer*** as
well ***Remote***

**How do we create multiple branches?**

Creating branch: **\--** git branch nav-bar

syntax: git branch \<\<branch name\>\>

Moving to another branch: git checkout nav-bar

syntax: git checkout \<\<branch-name\>\>

git branch -d \<\<branch name\>\>: to delete the branch locally. It is
also called ***safe delete***

git branch -D \<\<branch name\>\>: to delete the branch locally. It is
also called ***force delete***

git switch master: to change the branch

Git checkout and switch both are for changing the branch

git switch -c \<\<branch name\>\>: create a branch and move to that
branch

git checkout -b \<\<branch-name\>\>: create a branch and move to that
branch

Note: Commit before switching to another branch is good practise

go to .git folder & checkout HEAD file

git checkout HEAD\~2 : look at 2 commits prior

git restore filename: get back to last commit version

git push origin \--all: is used to **push all local branches** to the
remote repository (origin).

command to delete the branch from the remote repo:

![](media/image5.png){width="6.268055555555556in"
height="4.300694444444445in"}

**Merging the branches:** merging one branch into another branch

![](media/image6.png){width="3.3404494750656166in"
height="1.7362007874015748in"}

git merge \<\<branch name\>\>: to merge a branch into an existing branch

git branch -d \<\<branch name\>\>: to delete branch

git cherry-pick \<commitID\>: The git cherry-pick command is used to
**apply a specific commit (or set of commits) from one branch onto
another branch**.

![](media/image7.png){width="6.268055555555556in"
height="4.090972222222222in"}

**[Merge Conflicts:]{.underline}** A merge conflict happens when Git
cannot automatically combine changes from different branches because the
same part of a file was modified in two or more places.

![](media/image8.png){width="4.72656605424322in"
height="2.227130358705162in"}

![](media/image9.png){width="6.268055555555556in"
height="3.6152777777777776in"}

**[Git Clone:]{.underline}** it will allow us to get the data from
remote to local computer.

Or we can clone the existing repository using the git clone command

Cmd: git clone \<url\>

**[About Git Diff]{.underline}**

git diff: command shows the difference

-   It is not the difference between file a And file b. It shows the
    difference in single file

-   Syntax: git diff \--staged it will show changes made in a single
    file b/w the staging area

-   

**[Git stashing:]{.underline}**

-   Create a repo, work & commit on main

-   Switch to another branch & work

-   Conflicting changes do not allow to switch branch, without commits

\*\* git stash: command will allow us to switch between the branches
without committing the changes

Note! But we should go back to the previous branch and commit those
changes

Cmd: git stash save \<name for stash\>

\<name for stash\> is just a msg

Cmd: git stash apply \<stashID\>: to get the stashed data

git stash drop: it will drop the resent stash

git stash drop \<stashID\>: it will drop the particular stash

git stash clear: it will drop or delete all the stashes

\*\* git stash pop \<stashID\>: command will help us to apply the stash
and drop/delete that stash as soon as it applied

![](media/image10.png){width="6.268055555555556in" height="3.30625in"}

\*\* git stash list: it will give us the list of stashes ![A black board
with writing on it AI-generated content may be
incorrect.](media/image11.png){width="6.268055555555556in"
height="3.95in"}

![A screen shot of a black board with writing AI-generated content may
be incorrect.](media/image12.png){width="4.583568460192476in"
height="2.2778947944006998in"}

![A black board with white writing AI-generated content may be
incorrect.](media/image13.png){width="6.268055555555556in"
height="3.511111111111111in"}

**[Git Rebase:]{.underline}**

-   Alternative way of merging

-   Clean up tool (clean up commits)

> **Note!:** This command usually meant to run from the ***[side
> branches]{.underline}***, should not run on the ***[master or
> main]{.underline}*** branch

![A blackboard with writing on it AI-generated content may be
incorrect.](media/image14.png){width="3.6738003062117235in"
height="1.9862128171478566in"}

Cmd: git rebase master

Note: make sure to run the above command on the other branch not on the
master or main branch.

![A screen shot of a computer AI-generated content may be
incorrect.](media/image15.png){width="5.000256999125109in"
height="2.291784776902887in"}

**[Git Tags]{.underline}**

**[Git tags vs branching:]{.underline}** 👉 Think of a **branch** as a
\"work in progress line,\" and a **tag** as a \"bookmark in history.\"

**Branches**

-   **Purpose**: For ongoing development.

-   **Moves forward**: A branch pointer moves automatically as new
    commits are made.

-   **Use case**: Work on features, bug fixes, or experiments.

-   **Example**: main, dev, feature/login.

-   **Lifecycle**: Created → commits added → eventually merged or
    deleted.

![](media/image16.png){width="6.268055555555556in"
height="1.3979166666666667in"}

**Tags**

-   **Purpose**: To mark a specific point (commit) in history.

-   **Does not move**: A tag is fixed to a commit forever.

-   **Use case**: Marking releases or milestones (v1.0, v2.1, etc.).

-   **Types**:

    -   **Lightweight tag**: Just a name for a commit.

    -   **Annotated tag**: Stores extra info like message, author, date.

![](media/image17.png){width="6.268055555555556in"
height="1.0034722222222223in"}

  ---------------------------------------------------------------------------
  **Feature**   **Branch**                     **Tag**
  ------------- ------------------------------ ------------------------------
  Moves?        Yes, moves with new commits    No, fixed to a commit

  Use case      Development, collaboration     Mark releases/milestones

  Lifecycle     Temporary, often deleted       Permanent (historical marker)

  Nature        Mutable                        Immuable

  Example       feature/payment                v2.0.1
  ---------------------------------------------------------------------------

![](media/image18.png){width="6.268055555555556in"
height="4.071527777777778in"}

**[Some common commands:]{.underline}**

1.  git \--version: it shows the git version.

2.  git status: it shows the status of our git-initiated folder in our
    local machine

3.  git init: it is one time per project. It initializes the folder as
    git folder

    -   a hidden folder called .git to keep track of all the files and
        > sub-folder.

4.  git commit: it is like check points in the video game, the code or
    folder should have been committed, before pushing the code to the
    repo. Else it wont allow us to push the code to the repo

Syntax: git commit *-m* "commit message"

**[Here:]{.underline}** -m means message.

5.  git log: it shows up the committed logs

6.  git config \--global core.editor "code \--wait": Set a default code
    editor to Vscode *on* commit

7.  git branch: it will show the current branch

8.  git branch \<\<branch name\>\>: to create a branch

9.  git checkout \<\<branch-name\>\>

10. git switch master: to change the branch

11. git switch -c dark-mode: to create the branch and move to another
    branch

12. git checkout -b pink-mode: to create the branch and move to another
    branch

13. git checkout HEAD\~2: look at 2 commits prior

14. git restore filename: get back to last commit version

15. git merge \<\<branch name\>\>: to merge a branch into an existing
    branch

16. git branch -d \<\<branch name\>\>: to delete branch

17. git diff \--staged it will shows changes made in a single file b/w
    the stagging area

18. git stash: command will allow us to switch between the branches
    without committing the changes

19. \*\* git stash pop: command will help us to brought back the
    previous branch and allow us to commit the changes on those branch

20. \*\* git stash list: it will give us the list of stashes

21. git clone \<url\> : to clone the existing repo

**Interview Questions:**

👉 In interviews, a common way to explain is:

-   **fetch** = \"Tell me what's new, but don't touch my code yet.\"

-   **pull** = \"Bring the new changes into my branch right now.\"

![](media/image19.png){width="4.95943460192476in"
height="2.4692771216097986in"}

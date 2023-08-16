# capstone-project-comp3900-m18b-segmentationfault
capstone-project-comp3900-m18b-segmentationfault created by GitHub Classroom


 > **Note:** To start **Front-end Server** and  **Back-end Server** on VM using development mode, you need to follow the **section 1** to build environments on VM machine 

 > **Note:** If you running our system using VM by development mode then following **section 1.1 or 1.2** is enough, **section 2** is using for running front-end in production / developments mode.

 > **Note:** **Section 3** is the default user accounts and customer records use for after you following **Section 1** and use our system

  - Link to our group [github repo](https://github.com/unsw-cse-comp3900-9900-22T3/capstone-project-comp3900-m18b-segmentationfault/tree/main)


# Contents
- [1. Setup environments on VM](#1-setup-environments-on-vm)
  - [1.1. Running setup.sh file to configure environment](#11-running-setupsh-file-to-configure-environment)
  - [1.2. Step by step follow the instructions](#12-step-by-step-follow-the-instructions)
  - [1.3. How to reset initial database mock data](#13-how-to-reset-initial-database-mock-data)
  - [1.4. How to rerun our system in case you accidently close it](#14-how-to-rerun-our-system-in-case-you-accidently-close-it)
- [2. How to run frontend in Production mode](#2-how-to-run-frontend-in-production-mode)
  - [2.1. Before you build](#21-before-you-build)
  - [2.2. Build the frontend](#22-build-the-frontend)
  - [2.3. Run the frontend](#23-run-the-frontend)
  - [2.4. How to run frontend in Development mode](#24-how-to-run-frontend-in-development-mode)
- [3. Deafult User accounts](#3-deafult-user-accounts)
  - [3.1. Manager accounts](#31-manager-accounts)
  - [3.2. Kitchen staff accounts](#32-kitchen-staff-accounts)
  - [3.3. Watier staff accounts](#33-watier-staff-accounts)
  - [3.4. Past customers](#34-past-customers)


# 1. Setup environments on VM
### **Must be run inside Lubuntu 20.4.1 LTS virtual machine**
 *Note*: Our team chose to use VM as the development environment for our project, We followed the [COMP3900 Virtual Machine Guide](https://webcms3.cse.unsw.edu.au/COMP9900/22T3/resources/80126) and running the [VM on VMware WorkStation](https://webcms3.cse.unsw.edu.au/COMP9900/22T3/resources/80127).
 
 *Note*:  Our team give 2 options to configure environments on VM, but make sure you have already have (unzip) our project directory and change it relative path to back-end folder from start.

 - Running the **setup.sh** under *back-end* folder
 - Step by step follow the instructions in **section 1.2** from *back-end* folder
 

## 1.1. Running setup.sh file to configure environment

 1. Change your path of terminal to our back-end folder which is under relative path
 ```
 capstone-project-comp3900-m18b-segmentationfault/back-end/
 ```
 2. run setup.sh file
 ```
 source setup.sh
 ```
- **Note** there are few things you need to do during the setup.sh running

    1. enter password `lubuntu` when you update apt
    2. press `y` for installing python3-pip & mysql-server
    3. when .sh file open the mysql server, enter ` sudo mysql ALTER USER ‘root’@’localhost’ IDENTIFIED WITH mysql_native_password BY ‘root’;` to change the password for mysql root user
	4. after you change the password for mysql root user, enter `CREATE DATABASE test;` to create database for project
	5. after creating database enter `exit`
	6. press any `y` if terminal ask you to do
	7. then setup.sh will automatically run the remaining command , install everything we need for project and start running our system.     
				             
 ## 1.2. Step by step follow the instructions

 1. open the terminal

 2. update apt,  **Note**: if need to enter the password, please type `lubuntu`
 ```
 sudo apt update
 ```
 3. Change your path of terminal to our back-end folder which is under relative path
 ```
 capstone-project-comp3900-m18b-segmentationfault/back-end/
 ```
 4. install python3-pip,  **Note**: press `y` if you need
 ```
 sudo apt install python3-pip
 ```
 5. install third party libraries for python
 ```
 pip install -r requirements.txt
 ```
 6. install Mysql server,  **Note**: press `y` if you need
 ```
 sudo apt install mysql-server
 ```
 7. change the root password for Mysql
 ```
 sudo mysql
 ALTER USER ‘root’@’localhost’ IDENTIFIED WITH mysql_native_password BY ‘root’;
 ```
 8. create database for project and exit Mysql
 ```
 CREATE DATABASE test;
 exit
 ```
9. config mock data for database
 ```
 python3 run.py
 ```
10. Change your path of terminal to our front-end folder which is under relative path
 ```
 capstone-project-comp3900-m18b-segmentationfault/waiter-manager-frontend/
 ```
11. install all of the package need for front-end, *Note*: press `y` if you need
 ```
 sudo apt install curl
 curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
 sudo apt-get install -y nodejs
 npm install --force
 ```
12. Now all of the environments are installed, if you want to run our system make sure you are under the relative path
 ```
 capstone-project-comp3900-m18b-segmentationfault/waiter-manager-frontend/
 ```
13. start our front-end & back-end server by typing
 ```
 npm run test
 ```
## 1.3. How to reset initial database mock data

**Note**: this section is not needed once you follow the section 1.1 / section 1.2 , then server will run automatically, this is just a recover step in case you accidently close terminal or some wired error happen.


**Note**: if you want to reset initial database data, please make sure you are under front-end folder,type

```
npm run data
```
## 1.4. How to rerun our system in case you accidently close it 

**Note**: this section is not needed once you follow the section 1.1 / section 1.2 , then server will run automatically, this is just a recover step in case you accidently close terminal or some wired error happen.


**Note**: please make sure you are under front-end folder,type

```
npm run test
```


# 2. How to run frontend in Production mode

## 2.1. Before you build

1. Ensure latest __node.js__ is installed

2. Install vite: 

    ```
    npm install -g vite
    ```
3. Install TypeScript

    ```
    npm install -g typescript
    ```

## 2.2. Build the frontend

1. Make sure you're inside frontend folder:

    ```
    cd waiter-manager-frontend
    ```
2. Install all dependencies
   
    ```
    npm install --force
    ```

3. Build the project

    ```
    npm run build
    ```

    Alternatively, you can run

    ```
    tsc && vite build
    ```

4. Now the built and bundled output is in the ```/dist``` folder

    ```
    cd dist
    ```

## 2.3. Run the frontend

0. Install ```live-server``` npm package, this can run ```html``` files on a local machine.

    ```
    npm install -g live-server
    ```

1. Make sure you run the ___backend server___ first, refer to the instructions from backend.

2. Inside the ```/dist``` folder, run the following command:

    ```
    live-server .
    ```

    This will run the frontend in production mode.

    The application entry point is now available at ```http://127.0.0.1:8080/welcome```

## 2.4. How to run frontend in Development mode

0. Make sure the latest ```Node.JS``` is installed.

1. cd into ```waiter-manager-frontend```.

2. run ```npm install --force```

3. After starting the backend server, run ```npm run test```.

The application entry point is now available at ```http://127.0.0.1:5173/welcome```



# 3. Deafult User accounts

## 3.1. Manager accounts

| Restaurant     | User_Name | Password  |
| -------------- | --------- | --------- |
| MkDonuts       | Alex      | Alex123!  |
| MkDonuts       | Yi        | Yi12345!  |
| Domin          | Tony      | Tony123!  |
| KDC            | Nancy     | Nancy123! |
| Hungry sparrow | Bunny     | Bunny123! |

## 3.2. Kitchen staff accounts

| Restaurant     | User_Name | Password    |
| -------------- | --------- | ----------- |
| MkDonuts       | Tom       | Tom1234!    |
| MkDonuts       | Anmiao    | Anmiao123!  |
| Domin          | Annalee   | Annalee123! |
| KDC            | Nina      | Nina123!    |
| Hungry sparrow | Ella      | Ella123!    |

## 3.3. Watier staff accounts

| Restaurant     | User_Name | Password   |
| -------------- | --------- | ---------- |
| MkDonuts       | Leo       | Leo1234!   |
| MkDonuts       | Yi        | Yi12345!   |
| Domin          | Nelson    | Nelson123! |
| KDC            | Fern      | Fern123!   |
| Hungry sparrow | Page      | Page123!   |

## 3.4. Past customers

| Restaurant     | User_Name | Num_People |
| -------------- | --------- | ---------- |
| MkDonuts       | Sabina    | 5          |
| MkDonuts       | Susan     | 10         |
| MkDonuts       | Liz       | 4          |
| MkDonuts       | Ray       | 4          |
| Domin          | Gina      | 5          |
| Domin          | Eris      | 7          |
| KDC            | Jennifer  | 5          |
| Hungry sparrow | Stephen   | 6          |




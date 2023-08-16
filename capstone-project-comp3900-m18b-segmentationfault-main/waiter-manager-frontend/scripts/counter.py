import os


src = 'C:\\data\\unsw\\COMP3900\\capstone-project-comp3900-m18b-segmentationfault\\waiter-manager-frontend\\src'

def main():
    count = 0
    for root, subdirs, files in os.walk(src):
        for file in files: 
            if (file.lower().endswith(('jpeg', 'jpg','webp','svg'))):
                continue
            file_path = os.path.join(root,file)
            local_count = 0
            with open(file_path, 'r') as f:
                lines = f.readlines()
                local_count+=len(lines)
                count+=local_count
            print(file_path + "\t\t\t\t\t\t" + str(local_count))
    print(count)

main()

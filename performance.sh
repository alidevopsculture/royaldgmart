#!/bin/bash

#################################################
# Linux Server Performance Monitoring Tool
# Author: Ali Murtaza
# Description: Real-time system monitoring with security analysis
#################################################

# SYSTEM INFORMATION
echo "--- System Information (Hostname, OS, Uptime, Load Average)---"
echo "Hostname: $(hostname)"
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME )"
echo "UPTIME: $(uptime -p)"
echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
echo "-------------------------------------------------------------"
# 2. CPU USAGE
echo "---CPU Usage---"
echo "CPU Cores: $(nproc)"
ps aux --sort=-%cpu | head -6 | awk 'NR==1 || NR>1 {printf "%-8s %-10s %5s %5s %s\n", $2, $1, $3"%", $4"%", $11}'
echo "-------------------------------------------------------------"
# 3. MEMORY USAGE
echo "---Memory Usage---"
free | grep Mem | awk '{printf "Memory Usage: %.2f%%\n", ($3/$2)*100}'
# 4. DISK USAGE
echo "---Disk Usage---"
df -h | grep -v tmpfs
echo "-------------------------------------------------------------"
# 5. TOP 5 CPU PROCESSES
echo "---Top 5 CPU & Memory Processes---"
ps aux --sort=-%mem | head -6
echo "-------------------------------------------------------------"
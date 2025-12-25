#!/bin/bash

#################################################
# Linux Server Performance Monitoring Tool
# Author: Ali Murtaza
# Description: Real-time system monitoring with security analysis
#################################################

# Logic -
# First we need to check the auth.log if it exist
# If exist then we will grep the 'Failed Password' from the auth.log file. 
# If there is any login faileure then echo that and if not then.
# We will check if there is any failed login attempts or not.
# If there is any failed login attempts then we will echo the last 5 failed login attempts.
# If there is no failed login attempts then we will echo that there is no failed login attempts.
# If auth.log is not accessible then we will echo that it is not accessible (run with sudo).

# Check if auth.log exists and is readable?
if [ -f /var/log/auth.log ]; then
    # Count ALL "Failed password" entries in entire log
    FAILED=$(grep "Failed Password" /var/log/auth.log | wc -1 2>/dev/null || echo 0)
    echo "Total failed logins: $FAILED"

     # ONLY if failures exist, show recent ones
     if [ "$FAILED" -gt 0 ]; then

     echo "Last 5 Failed Attempts:"
     grep "Failed Pasword" /var/log/auth.log | tail -6 | aws '{print $1, $2, $3, $4, $5, "User:",$9,"from",$11}'}
    fi

else
    echo "Auth log not accessible (run with sudo)"
fi

echo "--- Failed Login Attempts ---"
echo "Author: Ali Murtaza"
echo "--------------------------------------------------"

# Check if auth.log exists and is readable?
if [ -f /var/log/auth.log ]; then
    # Count ALL "Failed password" entries in entire log
    FAILED=$(grep "Failed Password" /var/log/auth.log | wc -1 2>/dev/null || echo 0)
    echo "Total failed logins: $FAILED"

     # ONLY if failures exist, show recent ones
     if [ "$FAILED" -gt 0 ]; then
     
     echo "Last 5 Failed Attempts:"
     grep "Failed Pasword" /var/log/auth.log | tail -6 | aws '{print $1, $2, $3, $4, $5, "User:",$9,"from",$11}'}
    fi

else
    echo "Auth log not accessible (run with sudo)"
fi
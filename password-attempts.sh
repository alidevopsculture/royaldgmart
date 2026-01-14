#!/bin/bash

#################################################
# Linux Server Performance Monitoring Tool
# Author: Ali Murtaza
# Description: Real-time system monitoring with security analysis
#################################################

echo "--- Failed Login Attempts ---"
echo "Author: Ali Murtaza"
echo "--------------------------------------------------"

# Check if auth.log exists and is readable
if [ -f /var/log/auth.log ]; then
    # Count ALL "Failed password" entries in entire log
    FAILED=$(grep "Failed password" /var/log/auth.log | wc -l 2>/dev/null || echo 0)
    echo "Total failed logins: $FAILED"

    # ONLY if failures exist, show recent ones
    if [ "$FAILED" -gt 0 ]; then
        echo "Last 5 Failed Attempts:"
        grep "Failed password" /var/log/auth.log | tail -5 | awk '{print $1, $2, $3, $4, $5, "User:",$9,"from",$11}'
    else
        echo "No failed login attempts found"
    fi
else
    echo "Auth log not accessible (run with sudo)"
fi
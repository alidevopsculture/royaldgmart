#!/bin/bash

echo "🏠 Starting Household Category Migration..."
echo "This will update all BED SHEETS, CURTAINS, BLANKETS, and MOSQUITO NETS to HOUSEHOLD category"
echo ""

# Navigate to backend directory
cd backend

# Run the migration script
echo "Running migration script..."
node migrate-household-categories.js

echo ""
echo "✅ Migration completed!"
echo ""
echo "📝 Next steps:"
echo "1. Restart your backend server: npm start"
echo "2. Clear browser cache to see updated categories"
echo "3. Test the new /household page"
echo ""
echo "🔗 The new household page will be available at: http://localhost:3000/household"
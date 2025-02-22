from flask import Flask, request, jsonify
import mysql.connector
from datetime import datetime, timedelta
import threading
import time

app = Flask(__name__)

# Use a more descriptive name than 'id' for the device identifier.
device_id = "no id"

# Database configuration
db_config = {
    "host": "127.0.0.1",
    "user": "remote_user2",
    "password": "Embedded2025!",
    "database": "DB2"
}

# Function to insert or update the average pollution values every minute
def insert_avg_pollution():
    while True:
        try:
            conn = mysql.connector.connect(**db_config)
            cursor = conn.cursor()

            # Get the timestamp for one minute ago
            one_min_ago = datetime.now() - timedelta(minutes=1)

            # Calculate the average pollution values
            avg_query = """
            SELECT AVG(ECO2), AVG(TVOC)
            FROM ENTRY
            WHERE ENTRY_TIME >= %s;
            """
            cursor.execute(avg_query, (one_min_ago,))
            avg_values = cursor.fetchone()

            if avg_values and avg_values[0] is not None and avg_values[1] is not None:
                avg_eco2 = round(avg_values[0], 2)
                avg_tvoc = round(avg_values[1], 2)

                # Use the current minute as the timestamp for storage
                entry_time = datetime.now().replace(second=0, microsecond=0)

                # Check if an entry already exists for this timestamp
                check_query = "SELECT COUNT(*) FROM ENTRY WHERE ID = %s AND ENTRY_TIME = %s"
                cursor.execute(check_query, (device_id, entry_time))
                exists = cursor.fetchone()[0]

                if exists:
                    # Update existing entry
                    update_query = """
                    UPDATE ENTRY
                    SET ECO2 = %s, TVOC = %s
                    WHERE ID = %s AND ENTRY_TIME = %s;
                    """
                    cursor.execute(update_query, (avg_eco2, avg_tvoc, device_id, entry_time))
                    print(f"Updated existing entry: (ECO2: {avg_eco2}, TVOC: {avg_tvoc}, TIME: {entry_time})")
                else:
                    # Insert new entry
                    insert_query = """
                    INSERT INTO ENTRY (ID, LONGITUDE, LATITUDE, ENTRY_TIME, ECO2, TVOC)
                    VALUES (%s, NULL, NULL, %s, %s, %s);
                    """
                    cursor.execute(insert_query, (device_id, entry_time, avg_eco2, avg_tvoc))
                    print(f"Inserted new entry: (ECO2: {avg_eco2}, TVOC: {avg_tvoc}, TIME: {entry_time})")

                conn.commit()

            cursor.close()
            conn.close()

        except mysql.connector.Error as err:
            print(f"Database Error: {err}")

        # Wait 60 seconds before the next update
        time.sleep(60)

# Start the background thread for automatic updates
threading.Thread(target=insert_avg_pollution, daemon=True).start()

@app.route('/data', methods=['POST'])
def receive_data():
    data = request.get_json()

    if not data or "eco2" not in data or "tvoc" not in data or "id" not in data:
        return jsonify({"status": "error", "message": "Missing required fields (use the correct version)"}), 400

    eco2 = data["eco2"]
    tvoc = data["tvoc"]
    global device_id
    device_id = data["id"]  # Update the global device identifier
    entry_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Insert raw data into ENTRY table
        insert_query = """
        INSERT INTO ENTRY (ID, LONGITUDE, LATITUDE, ENTRY_TIME, ECO2, TVOC)
        VALUES (%s, NULL, NULL, %s, %s, %s);
        """
        cursor.execute(insert_query, (device_id, entry_time, eco2, tvoc))
        conn.commit()

        cursor.close()
        conn.close()

        print(f"Data inserted: (ID: {device_id}, ECO2: {eco2}, TVOC: {tvoc}, TIME: {entry_time})")
        return jsonify({"status": "success"}), 200
    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
        return jsonify({"status": "error", "message": "Database error"}), 500

@app.route('/register', methods=['POST'])
def register():
    """
    This endpoint is used by the device to register itself.
    It expects a JSON payload with the 'id' field.
    """
    data = request.get_json()
    if not data or 'id' not in data:
        return jsonify({'status': 'error', 'message': 'Missing required field id'}), 400

    device_id_reg = data['id']
    print(f"Registration received for device id: {device_id_reg}")

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Corrected SQL query with parameterized values
        query = "SELECT COUNT(*) FROM USER WHERE ID = %s"
        cursor.execute(query, (device_id_reg,))  # Proper tuple format (device_id_reg,)

        result = cursor.fetchone()
        count = result[0] if result else 0

        cursor.close()
        conn.close()
        print(str(count))
        return jsonify({'exists': count > 0}), 200

    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
        return jsonify({'status': 'error', 'message': 'Database error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

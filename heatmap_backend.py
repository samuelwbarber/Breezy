from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def map():
    # Define data points (latitude, longitude, weight)
    heatmap_data = [
        {'lat': 51.5074, 'lng': -0.1278, 'weight': 0.8},  # Example data
        {'lat': 51.5136, 'lng': -0.1365, 'weight': 0.6},
        {'lat': 51.5094, 'lng': -0.1180, 'weight': 0.7}
    ]
    return render_template('map.html', heatmap_data=heatmap_data)

if __name__ == '__main__':
    app.run(debug=True)

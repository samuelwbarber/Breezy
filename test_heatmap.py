import folium
from folium.plugins import HeatMap

# Create a map centered on London
london_map = folium.Map(location=[51.5074, -0.1278], zoom_start=12)

# Define artificial heatmap data (latitude, longitude, weight)
heat_data = [
    [51.5074, -0.1278, 0.8],
    [51.5136, -0.1365, 0.6],
    [51.5094, -0.1180, 0.7],
    [51.5200, -0.1400, 0.5]
]

# Add HeatMap to the map
HeatMap(heat_data).add_to(london_map)

# Save the map to an HTML file
london_map.save("london_heatmap.html")

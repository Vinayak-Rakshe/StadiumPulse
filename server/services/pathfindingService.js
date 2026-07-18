/**
 * StadiumPulse Pathfinding Service
 * Implements a JSON graph of stadium locations (gates, seat blocks, concessions, facilities)
 * and Dijkstra's algorithm to find shortest paths.
 * Supports filtering for step-free (accessible) paths.
 */

// Define the graph nodes
const NODES = {
  "Gate 1": { name: "Gate 1", type: "Gate", desc: "Main Entrance (West Side)" },
  "Gate 2": { name: "Gate 2", type: "Gate", desc: "North Entrance" },
  "Gate 3": { name: "Gate 3", type: "Gate", desc: "East Entrance" },
  "Gate 4": { name: "Gate 4", type: "Gate", desc: "South Entrance" },
  
  "Zone A": { name: "Zone A", type: "Zone", desc: "West Concourse Concurrency" },
  "Zone B": { name: "Zone B", type: "Zone", desc: "North Concourse Concurrency" },
  "Zone C": { name: "Zone C", type: "Zone", desc: "East Concourse Concurrency (Stair Access Only)" },
  "Zone D": { name: "Zone D", type: "Zone", desc: "South Concourse Concurrency" },
  
  "Block 101": { name: "Block 101", type: "SeatBlock", desc: "Lower Level West seating" },
  "Block 102": { name: "Block 102", type: "SeatBlock", desc: "Lower Level North seating" },
  "Block 103": { name: "Block 103", type: "SeatBlock", desc: "Lower Level East seating" },
  "Block 104": { name: "Block 104", type: "SeatBlock", desc: "Lower Level South seating" },
  
  "Restroom West": { name: "Restroom West", type: "Restroom", desc: "ADA Accessible Restrooms (West)" },
  "Restroom East": { name: "Restroom East", type: "Restroom", desc: "Restrooms (East) - Stairs only" },
  
  "Food Court West": { name: "Food Court West", type: "Concession", desc: "Main Food Concession (West)" },
  "Food Court East": { name: "Food Court East", type: "Concession", desc: "East Concession Stall" },
  
  "First Aid Station": { name: "First Aid Station", type: "FirstAid", desc: "Medical and First Aid Office (North)" },
  "VIP Lounge": { name: "VIP Lounge", type: "Zone", desc: "Club Level VIP Suites" }
};

// Define edges connecting the nodes
// Each edge represents a pathway.
// weight is distance/time in seconds.
// isAccessible indicates if the path is step-free (no stairs, has ramps/elevators).
const EDGES = [
  // West Concourse Connections
  { from: "Gate 1", to: "Zone A", weight: 30, isAccessible: true, desc: "Walk straight from Gate 1 to the West Concourse" },
  { from: "Zone A", to: "Block 101", weight: 20, isAccessible: true, desc: "Take the step-free ramp to Block 101 seating entry" },
  { from: "Zone A", to: "Restroom West", weight: 15, isAccessible: true, desc: "Go straight to the accessible Restroom West" },
  { from: "Zone A", to: "Food Court West", weight: 25, isAccessible: true, desc: "Walk down the concourse corridor to the West Food Court" },
  { from: "Zone A", to: "VIP Lounge", weight: 45, isAccessible: true, desc: "Take Elevator E1 from West Concourse to VIP Level" },

  // North Concourse Connections
  { from: "Gate 2", to: "Zone B", weight: 30, isAccessible: true, desc: "Walk straight from Gate 2 to the North Concourse" },
  { from: "Zone B", to: "Block 102", weight: 20, isAccessible: true, desc: "Proceed through the accessible corridor to Block 102" },
  { from: "Zone B", to: "First Aid Station", weight: 10, isAccessible: true, desc: "Walk straight into the First Aid office on the right" },

  // South Concourse Connections
  { from: "Gate 4", to: "Zone D", weight: 35, isAccessible: true, desc: "Walk straight from Gate 4 to the South Concourse" },
  { from: "Zone D", to: "Block 104", weight: 20, isAccessible: true, desc: "Take the step-free access path to Block 104" },

  // East Concourse Connections (Stairs Only)
  { from: "Gate 3", to: "Zone C", weight: 40, isAccessible: true, desc: "Walk straight from Gate 3 to the East Concourse" },
  { from: "Zone C", to: "Block 103", weight: 35, isAccessible: false, desc: "Climb up the concrete stairs to the upper section of Block 103" },
  { from: "Zone C", to: "Restroom East", weight: 15, isAccessible: false, desc: "Proceed down the steps to Restroom East" },
  { from: "Zone C", to: "Food Court East", weight: 20, isAccessible: false, desc: "Climb the steps to the East Concession Stand" },

  // Connecting Concourses
  { from: "Zone A", to: "Zone B", weight: 60, isAccessible: true, desc: "Walk along the level circular concourse connecting West to North" },
  { from: "Zone B", to: "Zone C", weight: 70, isAccessible: false, desc: "Go down the security stairs connecting North concourse to East concourse" },
  { from: "Zone C", to: "Zone D", weight: 75, isAccessible: false, desc: "Walk down the steps connecting East concourse to South concourse" },
  { from: "Zone D", to: "Zone A", weight: 65, isAccessible: true, desc: "Walk along the flat walkway connecting South to West" }
];

// Reconstruct paths bidirectionally for ease of navigation
const getAdjacencyList = (accessibleOnly = false) => {
  const adj = {};
  
  // Initialize adjacency list for all nodes
  Object.keys(NODES).forEach(node => {
    adj[node] = [];
  });

  EDGES.forEach(edge => {
    // If accessibleOnly is active, skip edges that are not accessible
    if (accessibleOnly && !edge.isAccessible) {
      return;
    }

    adj[edge.from].push({ to: edge.to, weight: edge.weight, desc: edge.desc, isAccessible: edge.isAccessible });
    // Bidirectional paths - swap direction description accordingly
    let reversedDesc = edge.desc.includes("from") 
      ? edge.desc.replace(edge.from, "TEMP").replace(edge.to, edge.from).replace("TEMP", edge.to)
      : `Walk back along the path from ${edge.to} to ${edge.from}`;
    
    adj[edge.to].push({ to: edge.from, weight: edge.weight, desc: reversedDesc, isAccessible: edge.isAccessible });
  });

  return adj;
};

/**
 * Dijkstra's shortest path finder
 * @param {string} startNode 
 * @param {string} endNode 
 * @param {boolean} accessibleOnly 
 * @returns {object|null} { path, directions, totalDistance }
 */
const findShortestPath = (startNode, endNode, accessibleOnly = false) => {
  if (!NODES[startNode] || !NODES[endNode]) {
    return null;
  }

  const adj = getAdjacencyList(accessibleOnly);
  const distances = {};
  const previous = {};
  const edgeDetails = {};
  const queue = new Set();

  Object.keys(NODES).forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
    queue.add(node);
  });

  distances[startNode] = 0;

  while (queue.size > 0) {
    // Find node with minimum distance
    let u = null;
    queue.forEach(node => {
      if (u === null || distances[node] < distances[u]) {
        u = node;
      }
    });

    if (distances[u] === Infinity) {
      break; // Unreachable
    }

    if (u === endNode) {
      break; // Found target
    }

    queue.delete(u);

    (adj[u] || []).forEach(neighbor => {
      if (!queue.has(neighbor.to)) return;

      const alt = distances[u] + neighbor.weight;
      if (alt < distances[neighbor.to]) {
        distances[neighbor.to] = alt;
        previous[neighbor.to] = u;
        edgeDetails[neighbor.to] = neighbor; // store edge descriptor
      }
    });
  }

  // If path is unreachable
  if (distances[endNode] === Infinity) {
    return null;
  }

  // Reconstruct path
  const path = [];
  const directions = [];
  let current = endNode;

  while (current !== null) {
    path.unshift(current);
    if (previous[current] !== null) {
      directions.unshift({
        from: previous[current],
        to: current,
        instruction: edgeDetails[current].desc,
        weight: edgeDetails[current].weight,
        isAccessible: edgeDetails[current].isAccessible
      });
    }
    current = previous[current];
  }

  return {
    path,
    directions,
    totalDistance: distances[endNode],
    accessibleOnly
  };
};

module.exports = {
  NODES,
  EDGES,
  findShortestPath
};

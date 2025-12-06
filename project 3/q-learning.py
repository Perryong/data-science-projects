###########################################################################
# This file contains the code for the Q-Learning agent for the FrozenLake-v1 environment
###########################################################################

# Importing Libraries
import argparse
import numpy as np
import gym
import matplotlib.pyplot as plt
import time
from matplotlib.patches import Rectangle

# Define command-line arguments
parser = argparse.ArgumentParser()
parser.add_argument('--lr', type=float, default=0.8, help='learning rate')
parser.add_argument('--gemma', type=float, default=0.95, help='discount factor')
parser.add_argument('--num_episodes', type=int, default=10000, help='number of episodes')
parser.add_argument('--render', action='store_true', default=False, help='enable real-time visualization')
parser.add_argument('--render_episodes', type=int, default=10000, help='number of episodes to visualize (first N episodes)')
parser.add_argument('--render_delay', type=float, default=0.3, help='delay between frames in seconds')
args = parser.parse_args()

# Set the learning rate, discount factor, and number of episodes
lr = args.lr
gemma = args.gemma
num_episodes = args.num_episodes

# Create the environment
env = gym.make('FrozenLake-v1')

# Get environment description for visualization
env_desc = env.desc.astype(str) if hasattr(env, 'desc') else None
if env_desc is None:
    # Standard FrozenLake layout if desc not available
    env_desc = np.array([
        ['S', 'F', 'F', 'F'],
        ['F', 'H', 'F', 'H'],
        ['F', 'F', 'F', 'H'],
        ['H', 'F', 'F', 'G']
    ])

# Initialize the Q-table
Q = np.zeros([env.observation_space.n, env.action_space.n])

# Visualization setup
render_enabled = args.render
render_episodes = args.render_episodes
render_delay = args.render_delay
viz_fig = None
viz_ax = None

def visualize_frozen_lake(state, episode_num, step_num):
    """Visualize the FrozenLake environment with agent position"""
    global viz_fig, viz_ax
    
    # Create figure if it doesn't exist
    if viz_fig is None:
        viz_fig, viz_ax = plt.subplots(figsize=(8, 8))
        plt.ion()  # Turn on interactive mode
    
    # Clear the axis
    viz_ax.clear()
    
    # Map state to grid position
    row = state // 4
    col = state % 4
    
    # Color mapping
    color_map = {
        'S': '#ADD8E6',  # Light blue for Start
        'F': '#F0F0F0',  # Light gray for Frozen
        'H': '#FF6B6B',  # Red for Hole
        'G': '#90EE90'   # Green for Goal
    }
    
    # Draw the grid
    for i in range(4):
        for j in range(4):
            tile_type = env_desc[i][j]
            color = color_map.get(tile_type, '#FFFFFF')
            
            # Draw tile
            rect = Rectangle((j, 3-i), 1, 1, 
                           facecolor=color, 
                           edgecolor='black', 
                           linewidth=2)
            viz_ax.add_patch(rect)
            
            # Add text label
            viz_ax.text(j + 0.5, 3-i + 0.5, tile_type, 
                       ha='center', va='center', 
                       fontsize=16, fontweight='bold')
    
    # Draw agent position (yellow/orange circle)
    agent_circle = plt.Circle((col + 0.5, 3-row + 0.5), 0.3, 
                             color='#FFA500', zorder=10)
    viz_ax.add_patch(agent_circle)
    
    # Set axis properties
    viz_ax.set_xlim(0, 4)
    viz_ax.set_ylim(0, 4)
    viz_ax.set_aspect('equal')
    viz_ax.set_xticks([])
    viz_ax.set_yticks([])
    viz_ax.set_title(f'FrozenLake - Episode {episode_num+1}, Step {step_num+1}', 
                    fontsize=14, fontweight='bold')
    
    # Add legend
    legend_elements = [
        plt.Rectangle((0, 0), 1, 1, facecolor='#ADD8E6', edgecolor='black', label='Start (S)'),
        plt.Rectangle((0, 0), 1, 1, facecolor='#F0F0F0', edgecolor='black', label='Frozen (F)'),
        plt.Rectangle((0, 0), 1, 1, facecolor='#FF6B6B', edgecolor='black', label='Hole (H)'),
        plt.Rectangle((0, 0), 1, 1, facecolor='#90EE90', edgecolor='black', label='Goal (G)'),
        plt.Circle((0, 0), 0.1, color='#FFA500', label='Agent')
    ]
    viz_ax.legend(handles=legend_elements, loc='upper right', fontsize=10)
    
    plt.draw()
    plt.pause(render_delay)

# lists to store performance metrics
total_rewards = []
total_steps = []
success_rate = []
test_reward = []

# Run the Q-learning algorithm
for i in range(num_episodes):
    s = env.reset()
    done = False
    episode_reward = 0
    num_steps = 0
    
    # Check if we should render this episode
    should_render = render_enabled and (i < render_episodes)
    
    # The Q-Table learning algorithm
    while not done:
        try:
            s = s[0]
        except TypeError:
            pass
        
        # Visualize if rendering is enabled
        if should_render:
            visualize_frozen_lake(s, i, num_steps)
        
        a = np.argmax(Q[s,:] + np.random.randn(1,env.action_space.n)*(1./(i+1)))
        s_, r, done, _ , _ = env.step(a)
        
        # update Q values
        Q[s,a] = Q[s,a] + lr*(r + num_episodes*np.max(Q[s_,:]) - Q[s,a])
        s = s_
        episode_reward += r
        num_steps += 1
    
    # Visualize final state if rendering
    if should_render:
        try:
            final_state = s if isinstance(s, (int, np.integer)) else s[0]
        except (TypeError, IndexError):
            final_state = s
        visualize_frozen_lake(final_state, i, num_steps)
        time.sleep(0.5)  # Pause at end of episode
    
    # append performance metrics to lists
    total_rewards.append(episode_reward/num_steps)
    total_steps.append(num_steps)
    success_rate.append(int(episode_reward > 0))

    # Print episode metrics
    print("Episode:", i+1, "Reward:", episode_reward, "Steps:", num_steps)


# Plotting the averge rewards and episode Lengths gained throughout each episode per episode
fig, axs = plt.subplots(1, 2, figsize=(200, 5))
axs[0].plot(total_rewards, 'tab:green')
axs[0].set_title('Average Reward per Episode')
axs[1].plot(total_steps, 'tab:purple')
axs[1].set_title('number of steps taken per episode')

plt.show()

# Print overall metrics
print('----------------------------------------------------------')
print("Overall Average reward:", np.mean(total_rewards))
print("Overall Average number of steps:", np.mean(total_steps))
print("Success rate (%):", np.mean(success_rate)*100)

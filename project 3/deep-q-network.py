###########################################################################
# This file contains the code for the Deep Q-Learning agent for the FrozenLake-v1 environment
###########################################################################


# Importing the required libraries
import numpy as np
from keras.layers import Input, Dense
from keras.models import Model
from keras.optimizers import Adam
import gym
import matplotlib.pyplot as plt
import argparse
import time
from matplotlib.patches import Rectangle

# Initialize argparse to get the input values
parser = argparse.ArgumentParser(description='Q-Learning agent for FrozenLake-v1 environment')
parser.add_argument('--gamma', type=float, default=0.95, help='discount factor to take future rewards into account')
parser.add_argument('--alpha', type=float, default=0.8, help='learning rate, to update the Q-table')
parser.add_argument('--n_hl1', type=int, default=32, help='number of units in the first hidden layer')
parser.add_argument('--n_hl2', type=int, default=32, help='number of units in the second hidden layer')
parser.add_argument('--epsilon', type=float, default=0.2, help='epsilon value for epsilon-greedy policy')
parser.add_argument('--num_episodes', type=int, default=1000, help='number of episodes to train the agent')
parser.add_argument('--render', action='store_true', default=False, help='enable real-time visualization')
parser.add_argument('--render_episodes', type=int, default=10000, help='number of episodes to visualize (first N episodes)')
parser.add_argument('--render_delay', type=float, default=0.3, help='delay between frames in seconds')
args = parser.parse_args()

# Initializing the agent's parameters
env = gym.make("FrozenLake-v1")
state_size = env.observation_space.n
action_size = env.action_space.n

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

gamma = args.gamma
alpha = args.alpha
n_hl1 = args.n_hl1
n_hl2 = args.n_hl2
epsilon = args.epsilon
num_episodes = args.num_episodes
action_space = np.arange(action_size)

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

# The network is initialized to output Q-Values for each action associated with a given state.
inputs = Input(shape=[state_size,])
X = Dense(n_hl1)(inputs)
X = Dense(n_hl2)(X)
outputs = Dense(action_size)(X)
network = Model(inputs=inputs, outputs=outputs)
network.compile(optimizer=Adam(learning_rate=alpha),
loss="categorical_crossentropy")

# Following the epsilon greedy policy to choose actions
def epsilon_greedy_action(state, epsilon=0.2):
    state = np.eye(state_size)[state]
    qvalues = network.predict(state.reshape([1, state_size]))
    A = np.zeros((qvalues.shape[1]))+epsilon/action_size
    greedy_action = np.argmax(qvalues[0])
    A[greedy_action] += 1-epsilon
    action = np.random.choice(action_space, p=A)
    return action

# Getting the target Q-Values for a particular state, and next_state pair(under a specific action)
def target_qvalues(qvalues, action, next_state, reward):
    next_state = np.eye(state_size)[next_state]
    q_nextstate = network.predict(
    next_state.reshape([1, state_size]))
    max_q = np.argmax(q_nextstate[0])
    target_qvalues = qvalues
    target_qvalues[action] = reward+gamma*q_nextstate[0, max_q]
    return target_qvalues

# Updating the network for each set
def update_network(state, action, reward, next_state):
    state = np.eye(state_size)[state]
    qvalues = network.predict(state.reshape([1, state_size]))
    target_qvalues_up = target_qvalues(
    qvalues[0], action, next_state, reward).reshape([1, action_size])
    state = state.reshape([1, state_size])
    network.fit(state, target_qvalues_up, epochs=1)

# Training the agent through a series of episodes and storing their values
reward_history = []
episode_lengths = []

successes = 0
for i in range(num_episodes):

    # Resetting the environment
    reward_buffer = 0
    j = 0
    state_now = env.reset()
    
    # Handle state reset (could be tuple or int)
    try:
        if isinstance(state_now, tuple):
            state_now = state_now[0]
    except (TypeError, IndexError):
        pass
    
    # Check if we should render this episode
    should_render = render_enabled and (i < render_episodes)
    
    # Running the episode
    while True:
        # Visualize if rendering is enabled
        if should_render:
            visualize_frozen_lake(state_now, i, j)
        
        # Selecting an epsilon greedy action
        action = epsilon_greedy_action(state_now)
        # Going to the next state on the basis of the chosen action
        try:
            state_next, reward, done, _, _ = env.step(action)
        except ValueError:
            # Fallback for older gym versions
            state_next, reward, done, _ = env.step(action)
        # Updating the reward buffer and episode length
        reward_buffer += reward
        j += 1
        # Updating the network
        update_network(state_now, action, reward, state_next)

        # Checking if the episode is done
        if done == True:
            # Visualize final state if rendering
            if should_render:
                visualize_frozen_lake(state_next, i, j)
                time.sleep(0.5)  # Pause at end of episode
            
            print(f'episode {i} is done\n')
            reward_history.append(reward_buffer/j)
            episode_lengths.append(j)
            print("Average number of steps per episode is {}".format(np.mean(episode_lengths)))

            # Checking if the episode was successful
            if reward_buffer == 1:
                successes += 1
            break
        else:
            state_now = state_next


# Plotting the averge rewards and episode Lengths gained throughout each episode per episode
fig, axs = plt.subplots(1, 2, figsize=(200, 5))
axs[0].plot(reward_history, 'tab:green')
axs[0].set_title('Average Reward per Episode')
axs[1].plot(episode_lengths, 'tab:purple')
axs[1].set_title('number of steps taken per episode')

plt.show()

# Printing the average reward and success rate
print('Average Reward throughout all episodes is {}'.format(
    sum(reward_history)/len(reward_history)))

# Printing the success rate
print('Success rate is {}'.format(successes/num_episodes))
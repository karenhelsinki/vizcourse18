import pandas as pd

# assign filename
city_pop = '../data/WUP2014-F11a-30_Largest_Cities.csv'

# Load files
city_pop = pd.read_excel(city_pop)

# drop year/pop columns and remove dups
city_data = city_pop.drop(['Note'], axis = 1)
city_data = city_data[city_data.columns[3:9]].drop_duplicates()

# create json
city_data.to_json('../data/city_data.json')
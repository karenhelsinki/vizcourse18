import os
import pandas as pd
import json
import io

# To format world pop and raw pop with thousand seperator
def to_billion(num):
    return round(num/1000000000,2)
def to_million(num):
    return round(num/1000000,2)
def standard_formatter(num):
    return '{:,.2f}'.format(num)
def to_percentage(num):
    return '{:.2f}%'.format(num*100)


# To get path of current folder
path = os.path.dirname(__file__) + '/../data/'
DF_path = os.path.join(path,"INFO.xlsx")
JSON_path = os.path.join(path,"json_final2.json")

#List Title and how to process that title
Raw_Processing = {'WORLD_POP':to_billion,'RAW_POP':to_million,'NOM_POP':to_percentage}
List_Title = {'city':'CITY','lon':'LONG','lat':'LAT','raw_pop':'RAW_POP','norm_pop':'NOM_POP','rank':'RANK_ORDER','country':'COUNTRY_OR_AREA'}


# To load INFO.xlsx in the same folder into use and doing some raw data processing
Raw_Df = pd.read_excel(DF_path)
Unique_Years = sorted(set(Raw_Df['YEAR'].tolist()))

for Title,Function in Raw_Processing.items():
    Raw_Df[Title] = Raw_Df[Title].apply(lambda num:Raw_Processing[Title](num))

# List and Dictionary comprehension to create final Json Array
List_Json = dict()
List_Json['years'] = [{'year':Year,'world_pop':Raw_Df[Raw_Df['YEAR']==Year].WORLD_POP.tolist()[0]} for Year in Unique_Years]
List_Json['cities'] = {Year:[{Title:Row[Pos] for Title,Pos in List_Title.items()} for index,Row in Raw_Df[Raw_Df['YEAR']==Year].iterrows()] for Year in Unique_Years}

# Save json to file
with io.open(JSON_path,'w', encoding='utf-8') as f:
     f.write(json.dumps(List_Json, ensure_ascii=False))
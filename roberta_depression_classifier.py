# from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, roc_auc_score, accuracy_score
from transformers import RobertaTokenizer, RobertaForSequenceClassification, Trainer, TrainingArguments
import torch
import wandb
wandb.login()
import numpy as np
import re
import nltk
nltk.download(['punkt','stopwords'])
from nltk.corpus import stopwords
stopwords = stopwords.words('english')[4:]

def compute_metrics(pred):
    labels = pred.label_ids
    preds = pred.predictions.argmax(-1)
    f1 = f1_score(labels, preds)
    acc = accuracy_score(labels, preds)
    roc_auc = roc_auc_score(labels, preds)
    return {
        'accuracy': acc,
        'f1': f1,
        'roc_auc': roc_auc
    }

class DepressionDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)


# read 2 csvs using pandas (one pos, one neg)
# combine them to create text and label splits
def read_csv_split(split_dir):
    df = pd.read_csv(split_dir)
    df = df.drop_duplicates()
    df['tweet'] = df['tweet'].apply(lambda x: ' '.join([item for item in x.split() if item not in stopwords]))
    df['tweet'] = df['tweet'].apply(lambda x: x.encode('ascii', 'ignore').decode('ascii'))
    df["tweet"] = df["tweet"].str.lower()
    df['tweet'] = df['tweet'].apply(lambda x: re.split('https:\/\/.*', str(x))[0])
    df['tweet'] = df['tweet'].apply(lambda x: re.split('http:\/\/.*', str(x))[0])
    df['tweet'] = df['tweet'].str.replace('#', '')
    df['tweet'] = df['tweet'].apply(lambda x: ' '.join([word for word in x.split() if 'http' not in word and '@' not in word and '<' not in word]))

    texts = []
    labels = []
    # this may change slightly depending on what the dataset looks like
    for index, row in df.iterrows():
        texts.append(row['tweet'])
        labels.append(row['class'])

    return texts, labels


def encode_data(train=True):    
    texts, labels = read_csv_split('./dataset_to_train.csv')

    # # use sklearn to split into train and test sets
    train_texts, test_texts, train_labels, test_labels = train_test_split(texts, labels, test_size=.2, shuffle=True)

    # split train data into train and validation sets (if we want)
    train_texts, val_texts, train_labels, val_labels = train_test_split(train_texts, train_labels, test_size=.2, shuffle=True)

    if train:
        tokenizer = RobertaTokenizer.from_pretrained('roberta-base')

        train_encodings = tokenizer(train_texts, truncation=True, padding=True)
        val_encodings = tokenizer(val_texts, truncation=True, padding=True)
        test_encodings = tokenizer(test_texts, truncation=True, padding=True)

        train_dataset = DepressionDataset(train_encodings, train_labels)
        val_dataset = DepressionDataset(val_encodings, val_labels)
        test_dataset = DepressionDataset(test_encodings, test_labels)

        tokenizer.save_pretrained('./roberta_v3')

        return train_dataset, val_dataset, test_dataset
    
    else:
        return test_texts, test_labels
        
        


def train_model(train_dataset, val_dataset, test_dataset): 
    training_args = TrainingArguments(
        output_dir='./results_v3',         # output directory  
        evaluate_during_training=True,
        num_train_epochs=5,              # total number of training epochs
        per_device_train_batch_size=8,  # batch size per device during training
        per_device_eval_batch_size=32,   # batch size for evaluation
        warmup_steps=10,                # number of warmup steps for learning rate scheduler
        weight_decay=0.01,               # strength of weight decay
        logging_dir='./logs_v3',            # directory for storing logs
        logging_steps=15,
    )

    model = RobertaForSequenceClassification.from_pretrained("roberta-base")

    trainer = Trainer(
        model=model,                         # the instantiated  Transformers model to be trained
        args=training_args,                  # training arguments, defined above
        train_dataset=train_dataset,         # training dataset
        eval_dataset=val_dataset,             # evaluation dataset
        compute_metrics=compute_metrics
    )

    trainer.train()
    trainer.evaluate(test_dataset)

    model.save_pretrained('./roberta_v3')

def quick_test(tweet):
    tokenizer = RobertaTokenizer.from_pretrained('./roberta_v3')
    model = RobertaForSequenceClassification.from_pretrained('./roberta_v3')
    inputs = tokenizer(tweet, return_tensors="pt")
    model.eval()
    output = model(inputs['input_ids'], inputs['attention_mask'], labels=None)
    sigmoid = torch.nn.Sigmoid()
    softmax = torch.nn.Softmax(dim=0)
    output = softmax(sigmoid(output[0].squeeze()))
    output_class = torch.argmax(output)
    output = torch.max(output)
    if output_class == 0:
        output = 1 - output 
    print("tweet: ", tweet)
    print("prediction: ", output.item())
    return output.item()


    # training_args = TrainingArguments(
    #     output_dir='./practice',
    #     do_predict=True
    # )
    
    # trainer = Trainer(
    #     model=model,
    #     args=training_args
    # )
    # inputs = tokenizer(tweet, return_tensors="pt")
    # outputs = Trainer.predict(inputs)
    # print(outputs)
    # return outputs

    

# def test_model(train_dataset, val_dataset):
#     tokenizer = RobertaTokenizer.from_pretrained('./roberta_v1')
    
#     training_args = TrainingArguments(
#         output_dir='./results_v1_2',         # output directory         
#         per_device_train_batch_size=1,  # batch size per device during training
#         per_device_eval_batch_size=64,   # batch size for evaluation
#         warmup_steps=10,                # number of warmup steps for learning rate scheduler
#         weight_decay=0.01,               # strength of weight decay
#     )

#     model = RobertaForSequenceClassification.from_pretrained('./roberta_v1')

#     trainer = Trainer(
#         model=model,                         # the instantiated  Transformers model to be trained
#         args=training_args,      # training dataset
#         train_dataset=train_dataset,
#         eval_dataset=val_dataset,             # evaluation dataset
#         compute_metrics=compute_metrics
#     )
#     trainer.evaluate()



# ##### THIS IS TRADITIONAL TRAINING########
# from torch.utils.data import DataLoader
# from transformers import DistilBertForSequenceClassification, AdamW

# device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')

# model = DistilBertForSequenceClassification.from_pretrained('distilbert-base-uncased')
# model.to(device)
# model.train()

# train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)

# optim = AdamW(model.parameters(), lr=5e-5)

# for epoch in range(3):
#     for batch in train_loader:
#         optim.zero_grad()
#         input_ids = batch['input_ids'].to(device)
#         attention_mask = batch['attention_mask'].to(device)
#         labels = batch['labels'].to(device)
#         outputs = model(input_ids, attention_mask=attention_mask, labels=labels)
#         loss = outputs[0]
#         loss.backward()
#         optim.step()

# model.eval()



if __name__ == "__main__":
    test_tweets, test_labels = encode_data(train=False)
    quick_test(test_tweets[200])
    # train_data, val_data, test_data = encode_data(train=True)
    # train_model(train_data, val_data, test_data)

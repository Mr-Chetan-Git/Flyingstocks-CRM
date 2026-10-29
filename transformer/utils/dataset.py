import os

import pandas as pd
import torch
from torch.utils.data import Dataset


class SentimentDataset(Dataset):
    def __init__(self, samples, tokenizer, label_to_id, max_len):
        self.inputs = []
        self.labels = []

        for text, label in samples:
            token_ids = tokenizer.encode(
                text,
                add_eos=True,
                max_len=max_len,
                pad_to_max=True,
            )

            self.inputs.append(
                torch.tensor(token_ids, dtype=torch.long)
            )

            self.labels.append(
                torch.tensor(label_to_id[label], dtype=torch.long)
            )

    def __len__(self):
        return len(self.inputs)

    def __getitem__(self, idx):
        return {
            "input_ids": self.inputs[idx],
            "labels": self.labels[idx],
        }


class SummarizationDataset(Dataset):
    def __init__(self, pairs, tokenizer, max_src_len, max_tgt_len):

        self.sources = []
        self.targets_in = []
        self.targets_out = []

        for source_text, summary_text in pairs:

            src_ids = tokenizer.encode(
                source_text,
                add_eos=True,
                max_len=max_src_len,
                pad_to_max=True,
            )

            summary_core = tokenizer.encode(
                summary_text,
                add_sos=False,
                add_eos=False,
            )

            tgt_in = [tokenizer.sos_id] + summary_core
            tgt_out = summary_core + [tokenizer.eos_id]

            tgt_in = tgt_in[:max_tgt_len]
            tgt_out = tgt_out[:max_tgt_len]

            tgt_in += [tokenizer.pad_id] * (
                max_tgt_len - len(tgt_in)
            )

            tgt_out += [tokenizer.pad_id] * (
                max_tgt_len - len(tgt_out)
            )

            self.sources.append(
                torch.tensor(src_ids, dtype=torch.long)
            )

            self.targets_in.append(
                torch.tensor(tgt_in, dtype=torch.long)
            )

            self.targets_out.append(
                torch.tensor(tgt_out, dtype=torch.long)
            )

    def __len__(self):
        return len(self.sources)

    def __getitem__(self, idx):
        return {
            "src_ids": self.sources[idx],
            "tgt_in_ids": self.targets_in[idx],
            "tgt_out_ids": self.targets_out[idx],
        }


def load_summary_training_data(file_path):
    """
    Reads the CRM summarization training Excel file.

    Expected columns:
        Comments
        Summaries

    Returns:
        List[(comment, summary)]
    """

    if not os.path.exists(file_path):
        raise FileNotFoundError(
            f"Training file not found: {file_path}"
        )

    df = pd.read_excel(file_path)

    required_columns = ["Comments", "Summaries"]

    for column in required_columns:
        if column not in df.columns:
            raise ValueError(
                f"Missing required column: {column}"
            )

    df = df[required_columns]

    df = df.dropna()

    pairs = []

    for _, row in df.iterrows():

        comment = str(row["Comments"]).strip()

        summary = str(row["Summaries"]).strip()

        if comment and summary:
            pairs.append((comment, summary))

    print(f"Loaded {len(pairs)} summarization samples.")

    return pairs
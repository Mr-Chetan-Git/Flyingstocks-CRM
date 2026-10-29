import os
import torch


def save_checkpoint(model, optimizer, epoch, path):

    os.makedirs(os.path.dirname(path), exist_ok=True)

    torch.save(
        {
            "epoch": epoch,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict()
        },
        path,
    )

    print(f"\nCheckpoint Saved : {path}")


def load_checkpoint(model, optimizer, path, device):

    if not os.path.exists(path):

        print("No checkpoint found.")

        return 0

    checkpoint = torch.load(path, map_location=device)

    model.load_state_dict(checkpoint["model_state_dict"])

    if optimizer is not None:

        optimizer.load_state_dict(
            checkpoint["optimizer_state_dict"]
        )

    print(f"Checkpoint Loaded : {path}")

    return checkpoint["epoch"]
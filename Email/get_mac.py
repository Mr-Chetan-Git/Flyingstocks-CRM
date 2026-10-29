import uuid

def get_mac():
    return ':'.join(['{:02X}'.format((uuid.getnode() >> ele) & 0xff)
                     for ele in range(0, 8*6, 8)][::-1])

print("\n=== YOUR MAC ADDRESS ===\n")
print("Copy this and send it to the admin:\n")
print(get_mac())
input("\nPress Enter to exit...")

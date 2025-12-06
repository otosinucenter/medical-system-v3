---
description: Restore the project from the latest backup zip file.
---

1.  **Identify the latest backup file**:
    Find the most recent file matching the pattern `medical-system-backup-*.zip` in the current directory.

2.  **Confirm with User (Optional but Recommended)**:
    Ensure the user wants to overwrite the current state with the backup.

3.  **Unzip and Restore**:
    Run the following command to unzip the backup, overwriting existing files:
    ```bash
    unzip -o [BACKUP_FILENAME] -d .
    ```
    *Replace `[BACKUP_FILENAME]` with the actual filename found in step 1.*

4.  **Verify Restoration**:
    Check that key files exist and the application runs correctly.

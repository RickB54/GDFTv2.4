# GDFT — git-commands.md
# Quick Reference for Everyday Use

---

# ✅ PUSH LATEST COMMIT TO GITHUB

git add .
git commit -m "Your clear commit message here"
git push

---

# ✅ PULL LATEST CHANGES FROM GITHUB

git pull

---

# ✅ STAGE ALL CHANGES

git add .

---

# ✅ STAGE SPECIFIC FILE(S)

git add path/to/file.ts

---

# ✅ COMMIT STAGED CHANGES

git commit -m "Your commit message"

---

# ✅ CHECK STATUS OF FILES

git status

---

# ✅ VIEW COMMIT HISTORY

git log --oneline --decorate --graph --all

---

# ✅ CHECK REMOTE URL

git remote -v

---

# ✅ CHANGE REMOTE URL

git remote set-url origin https://github.com/YourUsername/YourRepo.git

---

# ✅ REMOVE FILES FROM REPO BUT KEEP LOCAL

git rm -r --cached folder_or_file
git commit -m "Remove unwanted files from repo"
git push

---

# ✅ CREATE NEW BRANCH

git checkout -b my-new-branch

---

# ✅ SWITCH TO EXISTING BRANCH

git checkout main

---

# ✅ CHECK BRANCHES

git branch

---

# ✅ INITIAL PROJECT SETUP — INSTALL DEPENDENCIES

npm install

---

# ✅ START LOCAL DEV SERVER

npm run dev

---

# ✅ BUILD FOR PRODUCTION

npm run build

---

# ✅ PREVIEW PRODUCTION BUILD LOCALLY

npm run preview

---

# ✅ CHECK NODE MODULES REMOVED FROM REPO

# Make sure .gitignore has node_modules/
# Then remove it from tracked files if needed

git rm -r --cached node_modules
git commit -m "Remove node_modules"
git push

---

# ✅ GENERAL SAFETY

# Always verify before push:
git remote -v
git status

# Keep one version per repo:
# New version = new root folder = new GitHub repo.

---

# 📋 Use this cheat sheet for every project!

// Third-Party Imports:
import fsExtra from 'fs-extra';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import path from 'path';

// Local Imports:
import userModel from '../../Models/UserModel.js';
import userLocationModel from '../../Models/UserLocationModel.js';
import userTagsModel from '../../Models/UserTagsModel.js';
import { hashPassword } from '../../Utils/authUtils.js';
import userStatusModel from '../../Models/UserStatusModel.js';
import { getTimestampWithTZ } from '../../Utils/timeUtils.js';

let generatedUsernames = new Set();
let generatedEmails = new Set();

async function setupProfilePicture(filePath, imageId, filename) {
    console.info('Copying user profile picture...');

    const imagePath = path.join(filePath, imageId + '.jpg');

    try {
        await fsExtra.copy(
            `/backend/src/Fixtures/data/users/images/${filename}`,
            imagePath
        );
        console.info('Profile picture copyed successfully!');
    } catch (error) {
        console.error('ERROR:', error);
        process.exit();
    }
}

function generateUsername() {
    let username;
    do {
        username = faker.internet.username();
    } while (
        generatedUsernames.has(username) ||
        username.length > 30 ||
        !/^[a-zA-Z0-9._]+$/.test(username)
    );

    generatedUsernames.add(username);
    return username;
}

function generateBio() {
    let bio;
    do {
        bio = faker.person.bio();
    } while (bio.length > 350);

    return bio;
}

function generateAge() {
    const birthdate = new Date(
        faker.date.birthdate({ mode: 'age', min: 18, max: 55 })
    );
    const age = birthdate.getTime();
    return age;
}

function generateEmail() {
    let email;
    do {
        email = faker.internet.email({
            provider: 'flamiing.com',
            allowSpecialCharacters: false,
        });
    } while (generatedEmails.has(email) || email.length > 50);

    generatedEmails.add(email);
    return email;
}

async function downloadImage(imageURL, savePath, imageId) {
    try {
        const response = await axios({
            method: 'get',
            url: imageURL,
            responseType: 'stream',
        });

        fsExtra.ensureDirSync(savePath);
        const imagePath = path.join(savePath, imageId + '.jpg');

        const writer = fsExtra.createWriteStream(imagePath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                resolve(true);
            });
            writer.on('error', (error) => {
                console.error('ERROR:', error);
                reject(false);
            });
        });
    } catch (error) {
        console.error('ERROR:', error);
        return false;
    }
}

async function generateProfilePicture(userId, gender) {
    const PROFILE_PICTURES = [
        'silly-cat-one.jpg',
        'silly-cat-two.jpg',
        'silly-cat-three.jpg',
        'silly-cat-four.jpg',
        'silly-cat-five.jpg',
        'silly-cat-six.jpg',
        'silly-cat-seven.jpg',
        'silly-cat-eight.jpg',
        'silly-cat-nine.jpg',
        'silly-cat-ten.jpg',
    ];

    const imageId = faker.string.uuid();
    const profilePictureFolderPath = path.join(
        `/uploads/users/${userId}/images/`
    );

    const imageURL = faker.image.personPortrait({ sex: gender, size: '512' });

    if (
        (await downloadImage(imageURL, profilePictureFolderPath, imageId)) ===
        false
    ) {
        const index = faker.number.int({ min: 0, max: 9 });
        const image = PROFILE_PICTURES[index];
        await setupProfilePicture(profilePictureFolderPath, imageId, image);
    }

    const profilePicturePath = path.join(
        profilePictureFolderPath,
        imageId + '.jpg'
    );
    return profilePicturePath;
}

function generateTags() {
    const TAG_IDS = [
        '35c3fd60-62e2-4de3-a89e-d5d8049b86c0',
        '9e9466ac-03e7-4486-89a1-46923fde7604',
        'b41bc5f6-a27f-4d9d-8f68-0e958344b675',
        '6d0470d7-151d-48e2-baad-d0b91b8a47d4',
        'b78e981b-79f8-493d-9e63-fe066e6405da',
        '895ed9dd-6026-44ef-a040-62f675ccd8be',
        '38845071-fd62-4034-a27a-742f927ac336',
        '16da9a0f-7adc-4e42-b77d-90d675b99e05',
        'fcdfb75a-c8d0-411e-a207-7f5750c3c8c4',
        '0c987114-86ac-429c-9d02-2a1faf3b8b95',
        'dfee64e5-59a8-4465-978f-2ca2e9f7ba0d',
        '92cd8e68-a1a9-4e6f-9148-04f5f4347cc4',
        '071314e4-db94-44e3-b8a4-0d23df9e7da8',
        'a9882191-5966-4433-b3f3-40136fb28229',
        '4849cd2e-6436-4dd6-a21c-32f8a36a38c3',
    ];

    let usedTagIndex = new Set();

    const numOfTags = faker.number.int({ min: 0, max: 15 });
    let userTags = [];
    for (let count = 0; count < numOfTags; count++) {
        let index;
        do {
            index = faker.number.int({ min: 0, max: 14 });
        } while (usedTagIndex.has(index));

        usedTagIndex.add(index);
        userTags.push(TAG_IDS[index]);
    }

    return userTags;
}

function generateLocation() {
    const randomLocation = Math.random() < 0.1 ? true : false;

    const location = {
        latitude: randomLocation
            ? faker.location.latitude({ max: 90, min: -90, precision: 4 })
            : faker.location.latitude({
                  max: 41.7971,
                  min: 39.9931,
                  precision: 4,
              }),
        longitude: randomLocation
            ? faker.location.longitude({ max: 180, min: -180, precision: 4 })
            : faker.location.longitude({
                  max: -2.534,
                  min: -4.9,
                  precision: 4,
              }),
        allows_location:
            faker.number.int({ min: 1, max: 2 }) % 2 === 0 ? true : false,
    };

    return location;
}

async function generateUser() {
    const userId = faker.string.uuid();
    const gender = faker.person.sex();

    const user = {
        id: userId,
        email: generateEmail(),
        username: generateUsername(),
        first_name: faker.person.firstName(gender),
        last_name: faker.person.lastName(),
        password: '8Dt553Qi.',
        age: generateAge(),
        biography: generateBio(),
        profile_picture: await generateProfilePicture(userId, gender),
        fame: faker.number.int({ min: 0, max: 1500, multipleOf: 10 }),
        active_account: true,
        oauth: false,
        gender,
        sexual_preference:
            Math.random() < 0.1 ? 'bisexual' : faker.person.sex(),
        tags: generateTags(),
        location: generateLocation(),
    };

    return user;
}

export default async function loadUsers() {
    console.info('Loading user fixtures into DB...');

    for (let count = 0; count < 500; count++) {
        const user = await generateUser();
        const { location, tags } = user;
        delete user.location;
        delete user.tags;

        user.password = await hashPassword(user.password);

        const createdUser = await userModel.create({ input: user });
        if (!createdUser) {
            console.info('User fixtures were already loaded.');
            return;
        }
        await userTagsModel.updateUserTags(createdUser.id, tags);
        await userLocationModel.update(location, createdUser.id);
        await userStatusModel.create({
            input: {
                user_id: createdUser.id,
                socket_id: null,
                status: 'offline',
                last_online: getTimestampWithTZ(),
            },
        });

        console.info(`INFO: User created number ${count + 1}`);
    }

    console.info('Users added to the database successfully!');
}
